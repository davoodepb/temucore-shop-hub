-- 1. Create an enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Drop existing permissive policies on products
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;

-- 7. Create proper RLS policies for products
CREATE POLICY "Products are viewable by everyone"
ON public.products
FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert products"
ON public.products
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update products"
ON public.products
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete products"
ON public.products
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- 8. Drop existing permissive policies on chat_messages
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can update messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can view messages" ON public.chat_messages;

-- 9. Create proper RLS policies for chat_messages
-- Users can only view their own messages OR admins can view all
CREATE POLICY "Users can view their own messages or admins can view all"
ON public.chat_messages
FOR SELECT
USING (
  customer_email = auth.jwt()->>'email' 
  OR public.has_role(auth.uid(), 'admin')
);

-- Authenticated users can insert messages with their own email
CREATE POLICY "Authenticated users can insert their own messages"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' 
  AND customer_email = auth.jwt()->>'email'
);

-- Only admins can update messages (for marking as read, replying)
CREATE POLICY "Only admins can update messages"
ON public.chat_messages
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert messages (for replies)
CREATE POLICY "Admins can insert messages"
ON public.chat_messages
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));