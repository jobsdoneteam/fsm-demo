import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

export default async function InventoryPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const tenantId = (session.user as any).tenantId
  const items = await prisma.inventoryItem.findMany({
    where: { tenantId },
    orderBy: { category: 'asc' },
  })
  const lowStock = items.filter(i => i.quantityOnHand <= i.reorderPoint)
  const totalValue = items.reduce((s, i) => s + i.costPrice * i.quantityOnHand, 0)
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Inventory</h1><p className="text-sm text-gray-500 mt-1">{items.length} items</p></div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">+ Add Item</button>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="kpi-card"><p className="kpi-label">Total Items</p><p className="kpi-value">{items.length}</p></div>
        <div className="kpi-card"><p className="kpi-label">Low Stock</p><p className="kpi-value text-red-600">{lowStock.length}</p></div>
        <div className="kpi-card"><p className="kpi-label">Inventory Value</p><p className="kpi-value">{formatCurrency(totalValue)}</p></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="data-table">
          <thead><tr><th>SKU</th><th>Name</th><th>Category</th><th>On Hand</th><th>Reorder At</th><th>Cost</th><th>Sell Price</th><th>Status</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td className="text-gray-500 text-xs font-mono">{item.sku ?? '—'}</td>
                <td className="font-medium text-gray-800">{item.name}</td>
                <td className="text-gray-500 text-xs">{item.category}</td>
                <td className={`font-semibold ${item.quantityOnHand <= item.reorderPoint ? 'text-red-600' : 'text-gray-800'}`}>{item.quantityOnHand} {item.unit}</td>
                <td className="text-gray-500">{item.reorderPoint}</td>
                <td className="text-gray-600">{formatCurrency(item.costPrice)}</td>
                <td className="text-gray-600">{item.sellPrice > 0 ? formatCurrency(item.sellPrice) : '—'}</td>
                <td>
                  {item.quantityOnHand <= item.reorderPoint
                    ? <span className="badge bg-red-100 text-red-700">Low Stock</span>
                    : <span className="badge bg-green-100 text-green-700">In Stock</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
