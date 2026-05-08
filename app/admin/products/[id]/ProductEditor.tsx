'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ProductEditor({ productId }: { productId: string }) {
  const [productName, setProductName] = useState('Jollof Rice');
  const [category, setCategory] = useState('Rice Dishes');
  const [price, setPrice] = useState('18.00');
  const [comparePrice, setComparePrice] = useState('22.00');
  const [sku, setSku] = useState('MKK-001');
  const [stock, setStock] = useState('50');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [description, setDescription] = useState('Our signature Ghanaian jollof rice cooked with tomatoes, onions, and a blend of aromatic spices. Served with your choice of protein.');
  const [status, setStatus] = useState('Active');
  const [featured, setFeatured] = useState(true);
  const [activeTab, setActiveTab] = useState('general');

  const portions = [
    { id: 1, name: 'Regular', sku: 'MKK-REG-001', price: 18.00, stock: 50 },
    { id: 2, name: 'Large', sku: 'MKK-LRG-002', price: 24.00, stock: 30 },
    { id: 3, name: 'Family', sku: 'MKK-FAM-003', price: 45.00, stock: 15 },
  ];

  const images = [
    '/home_hero_1.jpeg',
    '/home_hero_2.jpeg',
    '/home_hero_3.jpeg',
  ];

  const tabs = [
    { id: 'general', label: 'General', icon: 'ri-information-line' },
    { id: 'pricing', label: 'Pricing & Inventory', icon: 'ri-price-tag-3-line' },
    { id: 'portions', label: 'Portions', icon: 'ri-bowl-line' },
    { id: 'images', label: 'Images', icon: 'ri-image-line' },
    { id: 'seo', label: 'SEO', icon: 'ri-search-line' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/products"
            className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            <i className="ri-arrow-left-line text-xl text-gray-700"></i>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Dish</h1>
            <p className="text-gray-600 mt-1">Update dish information and settings</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="px-6 py-3 border-2 border-[#C8952A]/50 text-[#C8952A] rounded-lg hover:border-[#C8952A] hover:bg-[#fdf9ec] transition-colors font-semibold whitespace-nowrap cursor-pointer">
            <i className="ri-eye-line mr-2"></i>
            Preview
          </button>
          <button className="px-6 py-3 bg-[#111111] hover:bg-[#333] text-white rounded-lg font-semibold transition-colors whitespace-nowrap cursor-pointer">
            <i className="ri-save-line mr-2"></i>
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 overflow-x-auto">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-[#C8952A] text-[#C8952A] bg-[#fdf9ec]'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <i className={`${tab.icon} text-xl`}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-8">
          {activeTab === 'general' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Dish Name *
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]"
                  placeholder="Enter dish name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  maxLength={500}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A] resize-none"
                  placeholder="Describe this dish..."
                />
                <p className="text-sm text-gray-500 mt-2">{description.length}/500 characters</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 pr-8 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A] cursor-pointer"
                  >
                    <option>Rice Dishes</option>
                    <option>Soups &amp; Stews</option>
                    <option>Grills &amp; Proteins</option>
                    <option>Sides &amp; Extras</option>
                    <option>Drinks &amp; Beverages</option>
                    <option>Desserts &amp; Snacks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-3 pr-8 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A] cursor-pointer"
                  >
                    <option>Active</option>
                    <option>Draft</option>
                    <option>Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 border-gray-300 rounded focus:ring-[#C8952A] cursor-pointer"
                />
                <label className="text-gray-900 font-medium">
                  Feature this dish on homepage
                </label>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-6 max-w-3xl">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Price (CA$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">$</span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-16 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Compare at Price (CA$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">$</span>
                    <input
                      type="number"
                      value={comparePrice}
                      onChange={(e) => setComparePrice(e.target.value)}
                      className="w-full pl-16 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]"
                      step="0.01"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Show original price for comparison</p>
                </div>
              </div>

              <div className="p-4 bg-[#fdf9ec] border border-[#e8c87a] rounded-lg">
                <p className="text-[#7a5418] font-semibold mb-1">Discount Calculation</p>
                <p className="text-[#a07020]">
                  Savings: CA$ {(parseFloat(comparePrice) - parseFloat(price)).toFixed(2)}
                  <span className="ml-2">
                    ({(((parseFloat(comparePrice) - parseFloat(price)) / parseFloat(comparePrice)) * 100).toFixed(0)}% off)
                  </span>
                </p>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Inventory</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      SKU *
                    </label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A] font-mono"
                      placeholder="MKK-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Daily Prep Quantity *
                    </label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]"
                  />
                  <p className="text-sm text-gray-500 mt-2">Get notified when daily prep quantity falls below this number</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'portions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Portions</h3>
                  <p className="text-gray-600 mt-1">Manage different serving sizes for this dish</p>
                </div>
                <button className="px-4 py-2 bg-[#111111] hover:bg-[#333] text-white rounded-lg font-semibold transition-colors whitespace-nowrap cursor-pointer">
                  <i className="ri-add-line mr-2"></i>
                  Add Portion
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Portion Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">SKU</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Price (CA$)</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Qty</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portions.map((portion) => (
                      <tr key={portion.id} className="border-b border-gray-100">
                        <td className="py-4 px-4">
                          <input
                            type="text"
                            defaultValue={portion.name}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <input
                            type="text"
                            defaultValue={portion.sku}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-mono"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <input
                            type="number"
                            defaultValue={portion.price}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                            step="0.01"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <input
                            type="number"
                            defaultValue={portion.stock}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-[#C8952A] hover:bg-[#fdf9ec] rounded-lg transition-colors cursor-pointer">
                            <i className="ri-delete-bin-line text-lg"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Dish Images</h3>
                <p className="text-gray-600">Add up to 10 images. First image will be the primary image.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
                      <img src={image} alt={`Dish ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    {index === 0 && (
                      <span className="absolute top-2 left-2 bg-[#111111] text-white px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">
                        Primary
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 rounded-xl">
                      <button className="w-9 h-9 flex items-center justify-center bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <i className="ri-eye-line"></i>
                      </button>
                      <button className="w-9 h-9 flex items-center justify-center bg-white text-[#C8952A] rounded-lg hover:bg-[#fdf9ec] transition-colors cursor-pointer">
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </div>
                ))}

                <button className="aspect-square border-2 border-dashed border-gray-300 rounded-xl hover:border-[#C8952A] hover:bg-[#fdf9ec] transition-colors flex flex-col items-center justify-center space-y-2 text-gray-600 hover:text-[#C8952A] cursor-pointer">
                  <i className="ri-upload-2-line text-3xl"></i>
                  <span className="text-sm font-semibold">Upload Image</span>
                </button>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Image Guidelines:</strong> Use high-quality food photos (min 1000x1000px). Natural lighting works best.
                  Supported formats: JPG, PNG, WebP (max 5MB each).
                </p>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Search Engine Optimization</h3>
                <p className="text-gray-600">Optimize how this dish appears in search results</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Page Title
                </label>
                <input
                  type="text"
                  defaultValue="Jollof Rice - Authentic Ghanaian Recipe | Maame K's Kitchen"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]"
                />
                <p className="text-sm text-gray-500 mt-2">60 characters recommended</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Meta Description
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  defaultValue="Authentic Ghanaian jollof rice made fresh daily at Maame K's Kitchen in Calgary. Order online for pickup or delivery."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A] resize-none"
                />
                <p className="text-sm text-gray-500 mt-2">160 characters recommended</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  URL Slug
                </label>
                <div className="flex items-center">
                  <span className="text-gray-600 bg-gray-100 px-4 py-3 border-2 border-r-0 border-gray-300 rounded-l-lg text-sm">
                    maamekskitchen.ca/product/
                  </span>
                  <input
                    type="text"
                    defaultValue="jollof-rice"
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Keywords
                </label>
                <input
                  type="text"
                  defaultValue="jollof rice, ghanaian food, calgary african food, west african cuisine"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]"
                />
                <p className="text-sm text-gray-500 mt-2">Separate keywords with commas</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
