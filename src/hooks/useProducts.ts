import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  stock: number;
  rating: number;
  reviewCount: number;
  description: string;
  isFeatured?: boolean;
  isFlashDeal?: boolean;
}

interface DbProduct {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image: string;
  category: string;
  stock: number;
  rating: number;
  review_count: number;
  description: string;
  is_featured: boolean;
  is_flash_deal: boolean;
  created_at: string;
  updated_at: string;
}

const mapDbToProduct = (dbProduct: DbProduct): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  price: Number(dbProduct.price),
  originalPrice: dbProduct.original_price ? Number(dbProduct.original_price) : undefined,
  image: dbProduct.image,
  category: dbProduct.category,
  stock: dbProduct.stock,
  rating: Number(dbProduct.rating),
  reviewCount: dbProduct.review_count,
  description: dbProduct.description,
  isFeatured: dbProduct.is_featured,
  isFlashDeal: dbProduct.is_flash_deal,
});

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedProducts = (data as DbProduct[]).map(mapDbToProduct);
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          price: product.price,
          original_price: product.originalPrice || null,
          image: product.image,
          category: product.category,
          stock: product.stock,
          rating: product.rating || 4.5,
          review_count: product.reviewCount || 0,
          description: product.description,
          is_featured: product.isFeatured || false,
          is_flash_deal: product.isFlashDeal || false,
        })
        .select()
        .single();

      if (error) throw error;

      const newProduct = mapDbToProduct(data as DbProduct);
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      toast({ title: 'Erro ao adicionar produto', variant: 'destructive' });
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.originalPrice !== undefined) dbUpdates.original_price = updates.originalPrice;
      if (updates.image !== undefined) dbUpdates.image = updates.image;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
      if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
      if (updates.reviewCount !== undefined) dbUpdates.review_count = updates.reviewCount;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.isFeatured !== undefined) dbUpdates.is_featured = updates.isFeatured;
      if (updates.isFlashDeal !== undefined) dbUpdates.is_flash_deal = updates.isFlashDeal;

      const { error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    } catch (error) {
      console.error('Error updating product:', error);
      toast({ title: 'Erro ao atualizar produto', variant: 'destructive' });
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({ title: 'Erro ao apagar produto', variant: 'destructive' });
      throw error;
    }
  };

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
  };
};
