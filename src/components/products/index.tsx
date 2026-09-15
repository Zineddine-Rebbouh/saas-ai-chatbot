import React from 'react'
import TabsMenu from '../tabs/intex'
import { SideSheet } from '../sheet'
import { Plus, Package } from 'lucide-react'
import { CreateProductForm } from './product-form'
import { TabsContent } from '../ui/tabs'
import { DataTable } from '../table'
import { TableCell, TableRow } from '../ui/table'
import Image from 'next/image'
import { getMonthName } from '@/lib/utils'

type Props = {
  products: {
    id: string
    name: string
    price: number
    image: string
    createdAt: Date
    domainId: string | null
  }[]
  id: string
}

const ProductTable = ({ id, products }: Props) => {
  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-border/60 bg-gradient-to-r from-blue-500/5 via-primary/[0.03] to-transparent flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_2px] shadow-blue-500/50 shrink-0" />
          <div>
            <h2 className="font-semibold text-base tracking-tight">Products</h2>
            <p className="text-xs text-muted-foreground">
              Add products to your store and offer them directly inside your AI Chatbot.
            </p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <TabsMenu
          className="w-full flex justify-start"
          triggers={[
            { label: 'All products' },
            { label: 'Live' },
            { label: 'Deactivated' },
          ]}
          button={
            <div className="flex-1 flex justify-end">
              <SideSheet
                description="Add products to your store and set them live to accept payments from customers."
                title="Add a product"
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 px-4 py-2 text-primary-foreground font-semibold rounded-xl text-xs transition-colors shadow-sm"
                trigger={
                  <>
                    <Plus size={16} />
                    <p>Add Product</p>
                  </>
                }
              >
                <CreateProductForm id={id} />
              </SideSheet>
            </div>
          }
        >
          <TabsContent value="All products" className="mt-4">
            <DataTable headers={['Featured Image', 'Name', 'Pricing', 'Created']}>
              {products.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell>
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-border/50 bg-muted/30 relative">
                      <Image
                        src={`https://ucarecdn.com/${product.image}/`}
                        fill
                        alt={product.name}
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                  <TableCell className="font-semibold text-primary">${product.price}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs font-mono">
                    {product.createdAt.getDate()}{' '}
                    {getMonthName(product.createdAt.getMonth())}{' '}
                    {product.createdAt.getFullYear()}
                  </TableCell>
                </TableRow>
              ))}
            </DataTable>
          </TabsContent>
        </TabsMenu>
      </div>
    </div>
  )
}

export default ProductTable
