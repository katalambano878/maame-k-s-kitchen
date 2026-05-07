'use client';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export default function SizeGuideModal({ isOpen, onClose, category = 'General' }: SizeGuideModalProps) {
  if (!isOpen) return null;

  const portionGuide = [
    { size: 'Small', servings: '1 person', notes: 'A light meal — great for lunch on the go' },
    { size: 'Regular', servings: '1 person (hungry)', notes: 'Our standard portion — generous and filling' },
    { size: 'Large', servings: '1–2 people', notes: 'Share-friendly or leave room for leftovers' },
    { size: 'Family Pack', servings: '3–4 people', notes: 'Great for the whole family or a small gathering' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="relative bg-white rounded-lg w-full max-w-2xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Portion Guide{category && category !== 'General' ? ` — ${category}` : ''}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            >
              <i className="ri-close-line text-2xl text-gray-700"></i>
            </button>
          </div>

          <div className="p-6">
            <div className="bg-[#fdf9ec] border border-[#e8c87a] rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="w-6 h-6 flex items-center justify-center mr-3">
                  <i className="ri-information-line text-xl text-[#C8952A]"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-[#7a5418] mb-2">Choosing the Right Portion</h3>
                  <ul className="text-sm text-[#a07020] space-y-1">
                    <li>• Our portions are generous — most adults are full after a Regular</li>
                    <li>• Soups & stews come with your choice of starch (rice, Ghanaian Dish, Ghanaian Dish, Ghanaian Dish)</li>
                    <li>• Going big? Family Packs feed 3–4 hungry people comfortably</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Size</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Serves</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {portionGuide.map((row, index) => (
                    <tr key={row.size} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-900">{row.size}</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">{row.servings}</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-4">
                Still not sure which size is right? Give us a call — we&apos;re happy to help.
              </p>
              <button className="px-6 py-3 bg-[#111111] text-white rounded-lg font-semibold hover:bg-[#111111] transition-colors whitespace-nowrap">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
