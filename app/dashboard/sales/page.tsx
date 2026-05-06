'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Download, X, Calendar, DollarSign } from 'lucide-react'
import * as XLSX from 'xlsx'
import { getUser } from '@/lib/auth'

interface Sale {
  id: string
  productType: string
  model: string
  price: number
  clientName: string | null
  comment: string | null
  createdAt: string
  manager: {
    name: string
  }
}

type SortField = 'date' | 'price' | 'model' | 'manager'
type SortOrder = 'asc' | 'desc'

export default function SalesPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Фильтры
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [productType, setProductType] = useState<'ALL' | 'LAPTOP' | 'COMPUTER'>('ALL')
  const [priceFrom, setPriceFrom] = useState('')
  const [priceTo, setPriceTo] = useState('')
  
  // Сортировка
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  
  const user = getUser()

  useEffect(() => {
    loadSales()
  }, [])

  const loadSales = async () => {
    try {
      const response = await fetch('/api/sales')
      const data = await response.json()
      setSales(data)
    } catch (error) {
      console.error('Error loading sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setDateFrom('')
    setDateTo('')
    setProductType('ALL')
    setPriceFrom('')
    setPriceTo('')
    setSearchQuery('')
  }

  const hasActiveFilters = dateFrom || dateTo || productType !== 'ALL' || priceFrom || priceTo || searchQuery

  const exportToExcel = () => {
    // Экспортируем отфильтрованные данные
    const exportData = filteredAndSortedSales.map((sale, index) => ({
      '№': index + 1,
      'Дата': new Date(sale.createdAt).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      'Тип': sale.productType === 'LAPTOP' ? 'Ноутбук' : 'Компьютер',
      'Модель': sale.model,
      'Клиент': sale.clientName || '-',
      'Менеджер': sale.manager.name,
      'Сумма (сом)': sale.price,
      'Комментарий': sale.comment || '-'
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Продажи')

    const columnWidths = [
      { wch: 5 },  // №
      { wch: 18 }, // Дата
      { wch: 12 }, // Тип
      { wch: 25 }, // Модель
      { wch: 20 }, // Клиент
      { wch: 20 }, // Менеджер
      { wch: 15 }, // Сумма
      { wch: 30 }  // Комментарий
    ]
    worksheet['!cols'] = columnWidths

    const fileName = `Продажи_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  // Применение фильтров
  const filteredSales = sales.filter(sale => {
    // Поиск
    const matchesSearch = !searchQuery || 
      sale.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.manager.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Фильтр по дате
    const saleDate = new Date(sale.createdAt)
    const matchesDateFrom = !dateFrom || saleDate >= new Date(dateFrom)
    const matchesDateTo = !dateTo || saleDate <= new Date(dateTo + 'T23:59:59')
    
    // Фильтр по типу товара
    const matchesProductType = productType === 'ALL' || sale.productType === productType
    
    // Фильтр по цене
    const matchesPriceFrom = !priceFrom || sale.price >= parseFloat(priceFrom)
    const matchesPriceTo = !priceTo || sale.price <= parseFloat(priceTo)
    
    return matchesSearch && matchesDateFrom && matchesDateTo && matchesProductType && matchesPriceFrom && matchesPriceTo
  })

  // Применение сортировки
  const filteredAndSortedSales = [...filteredSales].sort((a, b) => {
    let comparison = 0
    
    switch (sortField) {
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case 'price':
        comparison = a.price - b.price
        break
      case 'model':
        comparison = a.model.localeCompare(b.model)
        break
      case 'manager':
        comparison = a.manager.name.localeCompare(b.manager.name)
        break
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })

  // Статистика (на основе отфильтрованных данных)
  const totalSales = filteredSales.length
  const totalAmount = filteredSales.reduce((sum, sale) => sum + sale.price, 0)
  const averageCheck = totalSales > 0 ? totalAmount / totalSales : 0

  return (
    <div className="space-y-6">
      {/* Заголовок и действия */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-crown-navy">Продажи</h1>
          <p className="text-slate-600 mt-1">Управление продажами и статистика</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Добавить продажу
        </button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-slate-600 text-sm mb-1">Всего продаж</p>
          <p className="text-3xl font-bold text-crown-navy">{totalSales}</p>
          <p className="text-slate-500 text-sm mt-1">
            {hasActiveFilters ? 'По фильтрам' : 'За всё время'}
          </p>
        </div>
        <div className="card">
          <p className="text-slate-600 text-sm mb-1">Общая сумма</p>
          <p className="text-3xl font-bold text-crown-navy">{(totalAmount / 1000000).toFixed(1)}М</p>
          <p className="text-slate-500 text-sm mt-1">сом</p>
        </div>
        <div className="card">
          <p className="text-slate-600 text-sm mb-1">Средний чек</p>
          <p className="text-3xl font-bold text-crown-navy">{(averageCheck / 1000000).toFixed(1)}М</p>
          <p className="text-slate-500 text-sm mt-1">сом</p>
        </div>
      </div>

      {/* Поиск и кнопки */}
      <div className="card">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Поиск по модели, клиенту или менеджеру..."
                className="input pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'} flex items-center gap-2`}
          >
            <Filter className="w-5 h-5" />
            Фильтры
            {hasActiveFilters && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                !
              </span>
            )}
          </button>
          <button 
            onClick={exportToExcel}
            disabled={filteredAndSortedSales.length === 0}
            className="btn btn-success flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            Экспорт в Excel
          </button>
        </div>

        {/* Панель фильтров */}
        {showFilters && (
          <div className="border-t border-slate-200 pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Фильтр по дате от */}
              <div>
                <label className="label flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Дата от
                </label>
                <input
                  type="date"
                  className="input"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              {/* Фильтр по дате до */}
              <div>
                <label className="label flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Дата до
                </label>
                <input
                  type="date"
                  className="input"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

              {/* Фильтр по типу товара */}
              <div>
                <label className="label">Тип товара</label>
                <select
                  className="input"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value as any)}
                >
                  <option value="ALL">Все</option>
                  <option value="LAPTOP">Ноутбуки</option>
                  <option value="COMPUTER">Компьютеры</option>
                </select>
              </div>

              {/* Сортировка */}
              <div>
                <label className="label">Сортировка</label>
                <div className="flex gap-2">
                  <select
                    className="input flex-1"
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as SortField)}
                  >
                    <option value="date">По дате</option>
                    <option value="price">По цене</option>
                    <option value="model">По модели</option>
                    <option value="manager">По менеджеру</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="btn btn-secondary px-3"
                    title={sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию'}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            </div>

            {/* Фильтр по цене */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Цена от (сом)
                </label>
                <input
                  type="number"
                  className="input"
                  placeholder="0"
                  value={priceFrom}
                  onChange={(e) => setPriceFrom(e.target.value)}
                  step="1000000"
                />
              </div>
              <div>
                <label className="label flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Цена до (сом)
                </label>
                <input
                  type="number"
                  className="input"
                  placeholder="100000000"
                  value={priceTo}
                  onChange={(e) => setPriceTo(e.target.value)}
                  step="1000000"
                />
              </div>
            </div>

            {/* Кнопка очистки фильтров */}
            {hasActiveFilters && (
              <div className="flex justify-end">
                <button
                  onClick={clearFilters}
                  className="btn btn-secondary flex items-center gap-2 text-sm"
                >
                  <X className="w-4 h-4" />
                  Очистить все фильтры
                </button>
              </div>
            )}
          </div>
        )}

        {/* Информация о результатах */}
        {sales.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Показано: <span className="font-bold text-crown-navy">{filteredAndSortedSales.length}</span> из <span className="font-bold">{sales.length}</span> продаж
              {hasActiveFilters && (
                <span className="text-blue-600 ml-2">(применены фильтры)</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Таблица продаж */}
      <div className="card">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-crown-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Загрузка...</p>
          </div>
        ) : filteredAndSortedSales.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-600 mb-2">
              {hasActiveFilters ? 'Ничего не найдено по заданным фильтрам' : 'Нет продаж'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn btn-secondary text-sm"
              >
                Сбросить фильтры
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Дата</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Тип</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Модель</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Клиент</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Менеджер</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedSales.map((sale) => (
                  <SaleRow key={sale.id} sale={sale} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Модальное окно добавления продажи */}
      {showAddForm && (
        <AddSaleModal 
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false)
            loadSales()
          }}
        />
      )}
    </div>
  )
}

interface SaleRowProps {
  sale: Sale
}

function SaleRow({ sale }: SaleRowProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="py-3 px-4 text-sm">{formatDate(sale.createdAt)}</td>
      <td className="py-3 px-4">
        <span className={`badge ${sale.productType === 'LAPTOP' ? 'badge-info' : 'badge-success'}`}>
          {sale.productType === 'LAPTOP' ? 'Ноутбук' : 'Компьютер'}
        </span>
      </td>
      <td className="py-3 px-4 text-sm font-medium">{sale.model}</td>
      <td className="py-3 px-4 text-sm">{sale.clientName || '-'}</td>
      <td className="py-3 px-4 text-sm">{sale.manager.name}</td>
      <td className="py-3 px-4 text-sm font-bold text-right text-emerald-600">
        {sale.price.toLocaleString()} сом
      </td>
    </tr>
  )
}

interface AddSaleModalProps {
  onClose: () => void
  onSuccess: () => void
}

function AddSaleModal({ onClose, onSuccess }: AddSaleModalProps) {
  const [productType, setProductType] = useState('LAPTOP')
  const [model, setModel] = useState('')
  const [price, setPrice] = useState('')
  const [clientName, setClientName] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const user = getUser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert('Пользователь не найден')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          managerId: user.id,
          productType,
          model,
          price: parseFloat(price),
          clientName: clientName || null,
          comment: comment || null
        })
      })

      if (response.ok) {
        alert('Продажа успешно добавлена!')
        onSuccess()
      } else {
        const data = await response.json()
        alert(data.error || 'Ошибка при добавлении продажи')
      }
    } catch (error) {
      console.error('Error adding sale:', error)
      alert('Ошибка при добавлении продажи')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-crown-navy mb-6">Добавить продажу</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Тип товара</label>
              <select 
                className="input"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                required
              >
                <option value="LAPTOP">Ноутбук</option>
                <option value="COMPUTER">Компьютер</option>
              </select>
            </div>
            <div>
              <label className="label">Модель товара</label>
              <input 
                type="text" 
                className="input" 
                placeholder="Например: MacBook Pro 14"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Цена продажи (сом)</label>
            <input 
              type="number" 
              className="input" 
              placeholder="25000000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              step="1000"
            />
          </div>

          <div>
            <label className="label">Имя клиента (опционально)</label>
            <input 
              type="text" 
              className="input" 
              placeholder="Иван Иванов"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Комментарий (опционально)</label>
            <textarea 
              className="input" 
              rows={3} 
              placeholder="Дополнительная информация..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="submit" 
              className="btn btn-primary flex-1 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary flex-1"
              disabled={loading}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
