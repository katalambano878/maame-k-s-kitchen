'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface ProductFormProps {
  initialData?: any;
  isEditMode?: boolean;
}

const ALLERGENS = ['Nuts', 'Dairy', 'Eggs', 'Gluten', 'Shellfish', 'Soy', 'Fish', 'Sesame'];

export default function ProductForm({ initialData, isEditMode = false }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('general');
  const [dishName, setDishName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [status, setStatus] = useState(initialData?.status || 'active');
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [comparePrice, setComparePrice] = useState(initialData?.compare_at_price?.toString() || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [stock, setStock] = useState(initialData?.quantity?.toString() || '');
  const [lowStockThreshold, setLowStockThreshold] = useState(initialData?.metadata?.low_stock_threshold?.toString() || '10');
  const [isHalal, setIsHalal] = useState(initialData?.is_halal ?? true);
  const [isVegetarian, setIsVegetarian] = useState(initialData?.is_vegetarian ?? false);
  const [isVegan, setIsVegan] = useState(initialData?.is_vegan ?? false);
  const [isGlutenFree, setIsGlutenFree] = useState(initialData?.is_gluten_free ?? false);
  const [spiceLevel, setSpiceLevel] = useState<number>(initialData?.spice_level ?? 0);
  const [prepTime, setPrepTime] = useState(initialData?.prep_time?.toString() || '');
  const [calories, setCalories] = useState(initialData?.calories?.toString() || '');
  const [isAvailableToday, setIsAvailableToday] = useState(initialData?.is_available_today ?? true);
  const [allergens, setAllergens] = useState<string[]>(initialData?.allergens || []);
  const [ingredients, setIngredients] = useState(
    Array.isArray(initialData?.ingredients)
      ? initialData.ingredients.join(', ')
      : (initialData?.ingredients || '')
  );
  const [portions, setPortions] = useState<{ id?: string; name: string; price: string; stock: string; sku: string }[]>(
    initialData?.product_variants?.length
      ? initialData.product_variants.map((v: any) => ({ id: v.id, name: v.option1 || v.name || '', price: v.price?.toString() || '', stock: (v.stock ?? v.quantity ?? 0).toString(), sku: v.sku || '' }))
      : [{ name: 'Regular', price: '', stock: '', sku: '' }]
  );
  const [imageUrls, setImageUrls] = useState<string[]>(initialData?.product_images?.sort((a: any, b: any) => a.position - b.position).map((i: any) => i.url) || []);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [seoTitle, setSeoTitle] = useState(initialData?.metadata?.seo_title || '');
  const [seoDesc, setSeoDesc] = useState(initialData?.metadata?.seo_description || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [keywords, setKeywords] = useState(initialData?.metadata?.keywords || '');

  useEffect(() => { supabase.from('categories').select('id, name').then(({ data }) => { if (data) setCategories(data); }); }, []);
  useEffect(() => { if (!isEditMode && dishName) setSlug(dishName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')); }, [dishName, isEditMode]);

  const generateSku = () => `MKK-${Date.now().toString(36).toUpperCase().slice(-4)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
  const toggleAllergen = (a: string) => setAllergens(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  const addPortion = () => setPortions(prev => [...prev, { name: '', price: '', stock: '', sku: '' }]);
  const removePortion = (i: number) => setPortions(prev => prev.filter((_, idx) => idx !== i));
  const updatePortion = (i: number, field: string, value: string) => setPortions(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  const applyPortionPresets = () => { const base = parseFloat(price) || 0; setPortions([{ name: 'Regular', price: base.toFixed(2), stock: stock || '50', sku: generateSku() }, { name: 'Large', price: (base * 1.35).toFixed(2), stock: '30', sku: generateSku() }, { name: 'Family', price: (base * 2.5).toFixed(2), stock: '15', sku: generateSku() }]); };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingImage(true);
    const failed: string[] = [];
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const path = `dishes/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage.from('products').upload(path, file);
      if (error || !data) {
        failed.push(`${file.name}: ${error?.message || 'upload failed'}`);
        continue;
      }
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(path);
      setImageUrls(prev => [...prev, publicUrl]);
    }
    setUploadingImage(false);
    // Reset input so re-selecting the same file triggers a new upload
    e.target.value = '';
    if (failed.length) {
      alert(`Could not upload ${failed.length} image(s):\n\n${failed.join('\n')}`);
    }
  };

  const handleSubmit = async () => {
    if (!dishName.trim()) { alert('Dish name is required'); setActiveTab('general'); return; }
    if (!price) { alert('Price is required'); setActiveTab('pricing'); return; }
    setLoading(true);
    try {
      const ingredientsArray = ingredients
        .split(/[,\n]/)
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);

      const baseSlug = (slug || dishName.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/(^-|-$)/g, '');

      const productData: any = {
        name: dishName.trim(),
        description,
        category_id: categoryId || null,
        price: parseFloat(price),
        compare_at_price: comparePrice ? parseFloat(comparePrice) : null,
        sku: sku || generateSku(),
        quantity: parseInt(stock) || 0,
        status: status.toLowerCase(),
        featured,
        slug: baseSlug,
        is_halal: isHalal,
        is_vegetarian: isVegetarian,
        is_vegan: isVegan,
        is_gluten_free: isGlutenFree,
        spice_level: spiceLevel,
        prep_time: prepTime ? parseInt(prepTime) : null,
        calories: calories ? parseInt(calories) : null,
        is_available_today: isAvailableToday,
        allergens,
        ingredients: ingredientsArray,
        metadata: {
          low_stock_threshold: parseInt(lowStockThreshold) || 10,
          seo_title: seoTitle,
          seo_description: seoDesc,
          keywords,
        },
      };

      let productId = initialData?.id;
      if (isEditMode && productId) {
        const { error } = await supabase.from('products').update(productData).eq('id', productId);
        if (error) throw error;
      } else {
        let attempt = 0;
        let lastError: any = null;
        while (attempt < 5) {
          productData.slug =
            attempt === 0
              ? baseSlug
              : `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
          const { data, error } = await supabase
            .from('products')
            .insert(productData)
            .select('id')
            .single();
          if (!error && data) {
            productId = data.id;
            lastError = null;
            break;
          }
          // 23505 = unique_violation. Retry with a fresh slug suffix.
          if (error?.code === '23505' && /slug/i.test(error?.message || '')) {
            attempt++;
            lastError = error;
            continue;
          }
          throw error;
        }
        if (!productId) throw lastError || new Error('Could not generate a unique slug for this dish.');
      }

      if (isEditMode) await supabase.from('product_variants').delete().eq('product_id', productId);
      const validPortions = portions.filter(p => p.name.trim());
      if (validPortions.length > 0) {
        const { error: variantError } = await supabase
          .from('product_variants')
          .insert(validPortions.map((p, i) => ({
            product_id: productId,
            option1: p.name,
            name: p.name,
            price: parseFloat(p.price) || parseFloat(price),
            quantity: parseInt(p.stock) || 0,
            sku: p.sku || generateSku(),
            position: i,
          })));
        if (variantError) throw variantError;
      }

      if (imageUrls.length > 0) {
        if (isEditMode) await supabase.from('product_images').delete().eq('product_id', productId);
        const { error: imageError } = await supabase
          .from('product_images')
          .insert(imageUrls.map((url, i) => ({
            product_id: productId,
            url,
            position: i,
            alt_text: dishName,
          })));
        if (imageError) throw imageError;
      }

      alert(isEditMode ? 'Dish updated!' : 'Dish added to menu!');
      router.push('/admin/products');
    } catch (err: any) {
      const code = err?.code ? ` (code ${err.code})` : '';
      alert('Error saving dish: ' + (err?.message || 'Please try again.') + code);
    } finally {
      setLoading(false);
    }
  };

  const spiceLabels = ['None', 'Mild', 'Medium', 'Hot'];
  const tabs = [{ id: 'general', label: 'General', icon: 'ri-information-line' }, { id: 'pricing', label: 'Pricing', icon: 'ri-price-tag-3-line' }, { id: 'portions', label: 'Portions', icon: 'ri-bowl-line' }, { id: 'images', label: 'Images', icon: 'ri-image-line' }, { id: 'seo', label: 'SEO', icon: 'ri-search-line' }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/admin/products" className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
            <i className="ri-arrow-left-line text-xl text-gray-700"></i>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{isEditMode ? 'Edit Dish' : 'Add New Dish'}</h1>
            <p className="text-gray-600 mt-1">{isEditMode ? 'Update dish details and availability' : 'Add a new dish to your menu'}</p>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={loading} className="px-6 py-3 bg-[#111111] hover:bg-[#333] text-white rounded-lg font-semibold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 disabled:opacity-60">
          <i className={loading ? 'ri-loader-4-line animate-spin text-xl' : 'ri-save-line text-xl'}></i>
          {loading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add to Menu'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 overflow-x-auto">
          <div className="flex">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 px-6 py-4 font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${activeTab === tab.id ? 'border-[#C8952A] text-[#C8952A] bg-[#fdf9ec]' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                <i className={`${tab.icon} text-xl`}></i><span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-8">
          {activeTab === 'general' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Dish Name *</label>
                <input type="text" value={dishName} onChange={e => setDishName(e.target.value)} placeholder="e.g. Jollof Rice, Banku & Tilapia" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5} placeholder="Describe the dish — ingredients, how it's served, what makes it special..." className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A] resize-none" />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
                  <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-4 py-3 pr-8 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A] cursor-pointer">
                    <option value="">Select category...</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-3 pr-8 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A] cursor-pointer">
                    <option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="p-5 border-2 border-gray-200 rounded-xl space-y-5">
                <h3 className="font-bold text-gray-900">Dish Details</h3>
                <div className="grid md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Prep Time (mins)</label>
                    <input type="number" value={prepTime} onChange={e => setPrepTime(e.target.value)} placeholder="e.g. 20" min="0" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Calories (kcal)</label>
                    <input type="number" value={calories} onChange={e => setCalories(e.target.value)} placeholder="e.g. 450" min="0" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Available Today</label>
                    <button type="button" onClick={() => setIsAvailableToday(!isAvailableToday)} className={`w-full py-3 rounded-lg font-semibold border-2 transition-colors cursor-pointer ${isAvailableToday ? 'bg-green-50 border-green-400 text-green-700' : 'bg-gray-50 border-gray-300 text-gray-600'}`}>
                      <i className={`${isAvailableToday ? 'ri-checkbox-circle-line' : 'ri-close-circle-line'} mr-2`}></i>{isAvailableToday ? 'Available' : 'Unavailable'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Spice Level</label>
                  <div className="flex gap-3">
                    {spiceLabels.map((label, i) => (
                      <button key={i} type="button" onClick={() => setSpiceLevel(i)} className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-colors cursor-pointer ${spiceLevel === i ? (i === 0 ? 'bg-gray-100 border-gray-400 text-gray-800' : i === 1 ? 'bg-yellow-50 border-yellow-400 text-yellow-700' : i === 2 ? 'bg-orange-50 border-orange-400 text-orange-700' : 'bg-red-50 border-red-400 text-red-700') : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                        {i > 0 && '🌶'.repeat(i) + ' '}{label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 border-2 border-gray-200 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-4">Dietary Info</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {([{ label: 'Halal', icon: 'ri-check-double-line', value: isHalal, set: setIsHalal }, { label: 'Vegetarian', icon: 'ri-leaf-line', value: isVegetarian, set: setIsVegetarian }, { label: 'Vegan', icon: 'ri-plant-line', value: isVegan, set: setIsVegan }, { label: 'Gluten-Free', icon: 'ri-shield-check-line', value: isGlutenFree, set: setIsGlutenFree }] as { label: string; icon: string; value: boolean; set: (v: boolean) => void }[]).map(({ label, icon, value, set }) => (
                    <button key={label} type="button" onClick={() => set(!value)} className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-colors cursor-pointer ${value ? 'bg-[#fdf9ec] border-[#C8952A] text-[#C8952A]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                      <i className={`${icon} text-xl`}></i><span className="text-xs font-semibold">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Allergens</label>
                <div className="flex flex-wrap gap-2">
                  {ALLERGENS.map(a => (
                    <button key={a} type="button" onClick={() => toggleAllergen(a)} className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-colors cursor-pointer ${allergens.includes(a) ? 'bg-red-50 border-red-400 text-red-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {allergens.includes(a) && <i className="ri-alert-line mr-1"></i>}{a}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Ingredients</label>
                <textarea value={ingredients} onChange={e => setIngredients(e.target.value)} rows={3} placeholder="e.g. Rice, tomatoes, onions, scotch bonnet pepper, chicken stock..." className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A] resize-none" />
              </div>

              <div className="flex items-center space-x-3">
                <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} id="featured" className="w-5 h-5 accent-[#C8952A] cursor-pointer" />
                <label htmlFor="featured" className="text-gray-900 font-medium cursor-pointer">Feature this dish on the homepage</label>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-6 max-w-3xl">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Price (CA$) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">$</span>
                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" step="0.01" min="0" className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Compare at Price (CA$)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">$</span>
                    <input type="number" value={comparePrice} onChange={e => setComparePrice(e.target.value)} placeholder="0.00" step="0.01" min="0" className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Show original price with strikethrough</p>
                </div>
              </div>
              {comparePrice && price && parseFloat(comparePrice) > parseFloat(price) && (
                <div className="p-4 bg-[#fdf9ec] border border-[#e8c87a] rounded-lg">
                  <p className="text-[#7a5418] font-semibold">Discount: CA${(parseFloat(comparePrice) - parseFloat(price)).toFixed(2)} off ({(((parseFloat(comparePrice) - parseFloat(price)) / parseFloat(comparePrice)) * 100).toFixed(0)}%)</p>
                </div>
              )}
              <div className="pt-4 border-t border-gray-200 space-y-6">
                <h3 className="text-lg font-bold text-gray-900">Availability</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">SKU</label>
                    <div className="flex gap-2">
                      <input type="text" value={sku} onChange={e => setSku(e.target.value)} placeholder="MKK-001" className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A] font-mono text-sm" />
                      <button type="button" onClick={() => setSku(generateSku())} className="px-3 py-2 border-2 border-gray-300 rounded-lg hover:border-[#C8952A] text-gray-600 hover:text-[#C8952A] transition-colors cursor-pointer text-sm">Auto</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Daily Prep Quantity</label>
                    <input type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="e.g. 50" min="0" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Low Stock Alert Threshold</label>
                  <input type="number" value={lowStockThreshold} onChange={e => setLowStockThreshold(e.target.value)} min="0" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]" />
                  <p className="text-xs text-gray-500 mt-1">Alert when daily quantity drops below this number</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'portions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Portions / Serving Sizes</h3>
                  <p className="text-gray-600 mt-1">Define different sizes customers can order</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={applyPortionPresets} className="px-4 py-2 border-2 border-[#C8952A]/50 text-[#C8952A] rounded-lg hover:border-[#C8952A] hover:bg-[#fdf9ec] font-semibold transition-colors cursor-pointer text-sm">
                    <i className="ri-magic-line mr-1"></i>Presets
                  </button>
                  <button type="button" onClick={addPortion} className="px-4 py-2 bg-[#111111] hover:bg-[#333] text-white rounded-lg font-semibold transition-colors cursor-pointer text-sm">
                    <i className="ri-add-line mr-1"></i>Add Portion
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Portion Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">SKU</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Price (CA$)</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Daily Qty</th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {portions.map((portion, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-3 px-4"><input type="text" value={portion.name} onChange={e => updatePortion(i, 'name', e.target.value)} placeholder="e.g. Regular" className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]" /></td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <input type="text" value={portion.sku} onChange={e => updatePortion(i, 'sku', e.target.value)} placeholder="MKK-REG" className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]" />
                            <button type="button" onClick={() => updatePortion(i, 'sku', generateSku())} className="px-2 border-2 border-gray-300 rounded-lg text-xs text-gray-500 hover:border-[#C8952A] hover:text-[#C8952A] cursor-pointer">Auto</button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                            <input type="number" value={portion.price} onChange={e => updatePortion(i, 'price', e.target.value)} placeholder="0.00" step="0.01" min="0" className="w-full pl-7 pr-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]" />
                          </div>
                        </td>
                        <td className="py-3 px-4"><input type="number" value={portion.stock} onChange={e => updatePortion(i, 'stock', e.target.value)} placeholder="0" min="0" className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]" /></td>
                        <td className="py-3 px-4"><button type="button" onClick={() => removePortion(i)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"><i className="ri-delete-bin-line"></i></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-[#fdf9ec] border border-[#e8c87a] rounded-lg text-sm text-[#7a5418]">
                <i className="ri-information-line mr-2"></i>
                If you only have one size, leave just &quot;Regular&quot;. Click <strong>Presets</strong> to auto-fill Regular / Large / Family from the base price.
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Dish Images</h3>
                <p className="text-gray-600">Add up to 10 photos. The first image will be the primary display photo.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imageUrls.map((url, i) => (
                  <div key={i} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
                      <img src={url} alt={`Dish ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                    {i === 0 && <span className="absolute top-2 left-2 bg-[#111111] text-white px-2 py-1 rounded text-xs font-semibold">Primary</span>}
                    <button type="button" onClick={() => setImageUrls(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow cursor-pointer"><i className="ri-close-line"></i></button>
                  </div>
                ))}
                {imageUrls.length < 10 && (
                  <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl hover:border-[#C8952A] hover:bg-[#fdf9ec] transition-colors flex flex-col items-center justify-center space-y-2 text-gray-500 hover:text-[#C8952A] cursor-pointer">
                    <i className={uploadingImage ? 'ri-loader-4-line animate-spin text-3xl' : 'ri-upload-2-line text-3xl'}></i>
                    <span className="text-sm font-semibold">{uploadingImage ? 'Uploading...' : 'Upload Photo'}</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                <strong>Tips:</strong> Use well-lit, high-quality food photos (min 800x800px). Supported: JPG, PNG, WebP (max 5MB each).
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Search Engine Optimization</h3>
                <p className="text-gray-600">Help customers find this dish online</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Page Title</label>
                <input type="text" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder={`${dishName || 'Dish Name'} | Maame K's Kitchen Calgary`} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]" />
                <p className="text-xs text-gray-500 mt-1">{seoTitle.length}/60 characters recommended</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Meta Description</label>
                <textarea rows={3} value={seoDesc} onChange={e => setSeoDesc(e.target.value)} placeholder="A short description of the dish for search results..." className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A] resize-none" />
                <p className="text-xs text-gray-500 mt-1">{seoDesc.length}/160 characters recommended</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">URL Slug</label>
                <div className="flex items-center">
                  <span className="text-gray-600 bg-gray-100 px-4 py-3 border-2 border-r-0 border-gray-300 rounded-l-lg text-sm whitespace-nowrap">maamekskitchen.ca/product/</span>
                  <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Keywords</label>
                <input type="text" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="jollof rice, ghanaian food, calgary african food" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]" />
                <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

