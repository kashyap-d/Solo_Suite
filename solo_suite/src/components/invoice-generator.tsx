"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileText, Plus, Trash2, Download, Calculator, User, Building, Calendar, DollarSign } from "lucide-react"
import { generateInvoicePDF, calculateInvoiceTotals, generateInvoiceNumber } from "@/lib/pdf-utils"
import type { InvoiceData, InvoiceItem } from "@/lib/pdf-utils"
import { useAuth } from "@/contexts/auth-context"

export function InvoiceGenerator() {
  const { userProfile } = useAuth()
  const [open, setOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    provider: {
      name: userProfile?.name || "",
      email: userProfile?.email || "",
      address: "",
      phone: "",
      website: "",
    },
    client: {
      name: "",
      email: "",
      address: "",
      company: "",
    },
    items: [
      {
        description: "",
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ],
    subtotal: 0,
    tax: {
      rate: 0,
      amount: 0,
    },
    total: 0,
    notes: "",
    paymentTerms: "Payment is due within 30 days of invoice date.",
  })

  const updateInvoiceData = (field: string, value: any) => {
    setInvoiceData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const updateProvider = (field: string, value: string) => {
    setInvoiceData((prev) => ({
      ...prev,
      provider: {
        ...prev.provider,
        [field]: value,
      },
    }))
  }

  const updateClient = (field: string, value: string) => {
    setInvoiceData((prev) => ({
      ...prev,
      client: {
        ...prev.client,
        [field]: value,
      },
    }))
  }

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...invoiceData.items]
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    }

    // Calculate amount for this item
    if (field === "quantity" || field === "rate") {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate
    }

    setInvoiceData((prev) => ({
      ...prev,
      items: updatedItems,
    }))

    // Recalculate totals
    calculateTotals(updatedItems)
  }

  const addItem = () => {
    setInvoiceData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: "",
          quantity: 1,
          rate: 0,
          amount: 0,
        },
      ],
    }))
  }

  const removeItem = (index: number) => {
    const updatedItems = invoiceData.items.filter((_, i) => i !== index)
    setInvoiceData((prev) => ({
      ...prev,
      items: updatedItems,
    }))
    calculateTotals(updatedItems)
  }

  const calculateTotals = (items: InvoiceItem[]) => {
    const totals = calculateInvoiceTotals(items, invoiceData.tax?.rate || 0)
    setInvoiceData((prev) => ({
      ...prev,
      subtotal: totals.subtotal,
      tax: {
        ...prev.tax!,
        amount: totals.taxAmount,
      },
      total: totals.total,
    }))
  }

  const handleGeneratePDF = async () => {
    setGenerating(true)
    try {
      await generateInvoicePDF(invoiceData)
      setOpen(false)
      // Reset form
      setInvoiceData({
        ...invoiceData,
        invoiceNumber: generateInvoiceNumber(),
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        client: {
          name: "",
          email: "",
          address: "",
          company: "",
        },
        items: [
          {
            description: "",
            quantity: 1,
            rate: 0,
            amount: 0,
          },
        ],
        subtotal: 0,
        tax: {
          rate: 0,
          amount: 0,
        },
        total: 0,
        notes: "",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setGenerating(false)
    }
  }

  const isFormValid = () => {
    return (
      invoiceData.client.name.trim() !== "" &&
      invoiceData.client.email.trim() !== "" &&
      invoiceData.items.some((item) => item.description.trim() !== "" && item.amount > 0)
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <FileText className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            Generate Client Invoice
          </DialogTitle>
          <DialogDescription>Create a professional PDF invoice for your client</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceData.invoiceNumber}
                  onChange={(e) => updateInvoiceData("invoiceNumber", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="invoiceDate">Invoice Date</Label>
                <Input
                  id="invoiceDate"
                  type="date"
                  value={invoiceData.invoiceDate.toISOString().split("T")[0]}
                  onChange={(e) => updateInvoiceData("invoiceDate", new Date(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={invoiceData.dueDate.toISOString().split("T")[0]}
                  onChange={(e) => updateInvoiceData("dueDate", new Date(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Provider Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="providerName">Name</Label>
                <Input
                  id="providerName"
                  value={invoiceData.provider.name}
                  onChange={(e) => updateProvider("name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="providerEmail">Email</Label>
                <Input
                  id="providerEmail"
                  type="email"
                  value={invoiceData.provider.email}
                  onChange={(e) => updateProvider("email", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="providerPhone">Phone</Label>
                <Input
                  id="providerPhone"
                  value={invoiceData.provider.phone}
                  onChange={(e) => updateProvider("phone", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="providerWebsite">Website</Label>
                <Input
                  id="providerWebsite"
                  value={invoiceData.provider.website}
                  onChange={(e) => updateProvider("website", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="providerAddress">Address</Label>
                <Textarea
                  id="providerAddress"
                  value={invoiceData.provider.address}
                  onChange={(e) => updateProvider("address", e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Building className="h-4 w-4" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={invoiceData.client.name}
                  onChange={(e) => updateClient("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">Client Email *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={invoiceData.client.email}
                  onChange={(e) => updateClient("email", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientCompany">Company</Label>
                <Input
                  id="clientCompany"
                  value={invoiceData.client.company}
                  onChange={(e) => updateClient("company", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="clientAddress">Address</Label>
                <Textarea
                  id="clientAddress"
                  value={invoiceData.client.address}
                  onChange={(e) => updateClient("address", e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Invoice Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {invoiceData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                  <div className="md:col-span-2">
                    <Label htmlFor={`description-${index}`}>Description</Label>
                    <Input
                      id={`description-${index}`}
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                      placeholder="Service or product description"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`rate-${index}`}>Rate ($)</Label>
                    <Input
                      id={`rate-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => updateItem(index, "rate", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label>Amount</Label>
                      <div className="h-10 flex items-center px-3 bg-gray-50 border rounded-md">
                        <span className="font-medium">${item.amount.toFixed(2)}</span>
                      </div>
                    </div>
                    {invoiceData.items.length > 1 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={addItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardContent>
          </Card>

          {/* Totals and Tax */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Totals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={invoiceData.tax?.rate || 0}
                    onChange={(e) => {
                      const rate = Number.parseFloat(e.target.value) || 0
                      setInvoiceData((prev) => ({
                        ...prev,
                        tax: {
                          rate,
                          amount: (prev.subtotal * rate) / 100,
                        },
                        total: prev.subtotal + (prev.subtotal * rate) / 100,
                      }))
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">${invoiceData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span className="font-medium">${(invoiceData.tax?.amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-green-600">${invoiceData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes and Payment Terms */}
          <Card>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Textarea
                  id="paymentTerms"
                  value={invoiceData.paymentTerms}
                  onChange={(e) => updateInvoiceData("paymentTerms", e.target.value)}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={invoiceData.notes}
                  onChange={(e) => updateInvoiceData("notes", e.target.value)}
                  placeholder="Additional notes or terms..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGeneratePDF}
              disabled={!isFormValid() || generating}
              className="bg-green-600 hover:bg-green-700"
            >
              {generating ? (
                <>
                  <Download className="h-4 w-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate PDF Invoice
                </>
              )}
            </Button>
          </div>

          {!isFormValid() && (
            <Alert>
              <AlertDescription>
                Please fill in the required fields: Client Name, Client Email, and at least one invoice item with a
                description and amount.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
