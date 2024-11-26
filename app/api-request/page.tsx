'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

// Updated types to match your API response
type Exhibitor = {
  ExhibitorID: string
  company: string
  name: string
  position: string
  profile_picture: string
}

type Brand = {
  BrandID: string
  brand_name: string    // matches the name field from API
  image_url: string
  description: string
  stand_number: string
  product_tag: string
  location: string
  hall: string
  exhibitor_id: string
  exhibitor: Exhibitor | null  // Note: can be null based on your API
}

// Add this helper function at the top of your component
const formatTags = (tagString: string): string[] => {
  return tagString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
}

export default function APIRequestPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    brand_name: '',
    brands_image: '',
    stand_number: '',
    description: '',
    product_tag: '',
    location: '',
    hall: '',
    exhibitor_id: ''
  })

  // Add new states for exhibitor form
  const [showExhibitorForm, setShowExhibitorForm] = useState(false)
  const [isSubmittingExhibitor, setIsSubmittingExhibitor] = useState(false)
  const [exhibitorFormData, setExhibitorFormData] = useState({
    name: '',
    profile_picture: '',
    position: '',
    company: ''
  })

  // Add new states for editing
  const [editingBrand, setEditingBrand] = useState<string | null>(null) // stores BrandID of brand being edited
  const [editFormData, setEditFormData] = useState({
    brand_id: '',
    brand_name: '',
    brands_image: '',
    stand_number: '',
    description: '',
    product_tag: '',
    location: '',
    hall: '',
    exhibitor_id: ''
  })

  useEffect(() => {
    async function fetchBrands() {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/brands')
        if (!response.ok) {
          throw new Error('Failed to fetch brands')
        }
        const result = await response.json()
        console.log('API Response:', result)
        
        // Access the data array from the response
        if (!result.data || !Array.isArray(result.data)) {
          throw new Error('Invalid data format received from API')
        }
        
        setBrands(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBrands()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('http://127.0.0.1:5000/api/brands/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to add brand')
      }

      // Reset form and refresh brands
      setFormData({
        brand_name: '',
        brands_image: '',
        stand_number: '',
        description: '',
        product_tag: '',
        location: '',
        hall: '',
        exhibitor_id: ''
      })
      setShowForm(false)
      // Refetch brands
      setIsLoading(true)
      fetchBrands()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExhibitorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setExhibitorFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleExhibitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingExhibitor(true)
    setError(null)

    try {
      const response = await fetch('http://127.0.0.1:5000/api/brands/exhibitor/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exhibitorFormData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add exhibitor')
      }

      // Reset form
      setExhibitorFormData({
        name: '',
        profile_picture: '',
        position: '',
        company: ''
      })
      setShowExhibitorForm(false)
      // Show success message or refresh data if needed
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmittingExhibitor(false)
    }
  }

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand.BrandID)
    setEditFormData({
      brand_id: brand.BrandID,
      brand_name: brand.brand_name,
      brands_image: brand.image_url,
      stand_number: brand.stand_number,
      description: brand.description,
      product_tag: brand.product_tag,
      location: brand.location,
      hall: brand.hall,
      exhibitor_id: brand.exhibitor_id
    })
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('http://127.0.0.1:5000/api/brands/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData)
      })

      if (!response.ok) {
        throw new Error('Failed to update brand')
      }

      // Reset form and refresh brands
      setEditingBrand(null)
      setEditFormData({
        brand_id: '',
        brand_name: '',
        brands_image: '',
        stand_number: '',
        description: '',
        product_tag: '',
        location: '',
        hall: '',
        exhibitor_id: ''
      })
      // Refetch brands
      setIsLoading(true)
      fetchBrands()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">API Request Results</h1>
        <div className="space-x-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            {showForm ? 'Hide Brand Form' : 'Add New Brand'}
          </button>
          <button
            onClick={() => setShowExhibitorForm(!showExhibitorForm)}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            {showExhibitorForm ? 'Hide Exhibitor Form' : 'Add New Exhibitor'}
          </button>
        </div>
      </div>

      {/* Exhibitor Form */}
      {showExhibitorForm && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Add New Exhibitor</h2>
          <form onSubmit={handleExhibitorSubmit} className="max-w-2xl space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={exhibitorFormData.name}
                  onChange={handleExhibitorChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="profile_picture" className="block text-sm font-medium text-gray-700">
                  Profile Picture URL
                </label>
                <input
                  type="url"
                  id="profile_picture"
                  name="profile_picture"
                  value={exhibitorFormData.profile_picture}
                  onChange={handleExhibitorChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                  Position
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={exhibitorFormData.position}
                  onChange={handleExhibitorChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={exhibitorFormData.company}
                  onChange={handleExhibitorChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmittingExhibitor}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmittingExhibitor ? 'Adding...' : 'Add Exhibitor'}
              </button>
              
              <button
                type="button"
                onClick={() => setShowExhibitorForm(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Brand Form */}
      {showForm && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Add New Brand</h2>
          <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="brand_name" className="block text-sm font-medium text-gray-700">
                  Brand Name
                </label>
                <input
                  type="text"
                  id="brand_name"
                  name="brand_name"
                  value={formData.brand_name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="brands_image" className="block text-sm font-medium text-gray-700">
                  Image URL
                </label>
                <input
                  type="url"
                  id="brands_image"
                  name="brands_image"
                  value={formData.brands_image}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="stand_number" className="block text-sm font-medium text-gray-700">
                    Stand Number
                  </label>
                  <input
                    type="text"
                    id="stand_number"
                    name="stand_number"
                    value={formData.stand_number}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="hall" className="block text-sm font-medium text-gray-700">
                    Hall
                  </label>
                  <input
                    type="text"
                    id="hall"
                    name="hall"
                    value={formData.hall}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="product_tag" className="block text-sm font-medium text-gray-700">
                  Product Tags (comma-separated)
                </label>
                <input
                  type="text"
                  id="product_tag"
                  name="product_tag"
                  value={formData.product_tag}
                  onChange={handleChange}
                  placeholder="tag1, tag2, tag3"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                />
                {formData.product_tag && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formatTags(formData.product_tag).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="exhibitor_id" className="block text-sm font-medium text-gray-700">
                  Exhibitor ID
                </label>
                <input
                  type="text"
                  id="exhibitor_id"
                  name="exhibitor_id"
                  value={formData.exhibitor_id}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add Brand'}
              </button>
              
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand) => (
          <div 
            key={brand.BrandID}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow relative"
          >
            {/* Edit Button */}
            <button
              onClick={() => handleEdit(brand)}
              className="absolute top-2 right-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>

            {/* Edit Form Modal */}
            {editingBrand === brand.BrandID && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <h2 className="text-2xl font-bold mb-4">Edit Brand</h2>
                  <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="brand_name" className="block text-sm font-medium text-gray-700">
                        Brand Name
                      </label>
                      <input
                        type="text"
                        id="brand_name"
                        name="brand_name"
                        value={editFormData.brand_name}
                        onChange={handleEditChange}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="brands_image" className="block text-sm font-medium text-gray-700">
                        Image URL
                      </label>
                      <input
                        type="url"
                        id="brands_image"
                        name="brands_image"
                        value={editFormData.brands_image}
                        onChange={handleEditChange}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="stand_number" className="block text-sm font-medium text-gray-700">
                          Stand Number
                        </label>
                        <input
                          type="text"
                          id="stand_number"
                          name="stand_number"
                          value={editFormData.stand_number}
                          onChange={handleEditChange}
                          required
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label htmlFor="hall" className="block text-sm font-medium text-gray-700">
                          Hall
                        </label>
                        <input
                          type="text"
                          id="hall"
                          name="hall"
                          value={editFormData.hall}
                          onChange={handleEditChange}
                          required
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={editFormData.description}
                        onChange={handleEditChange}
                        required
                        rows={3}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="product_tag" className="block text-sm font-medium text-gray-700">
                        Product Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        id="product_tag"
                        name="product_tag"
                        value={editFormData.product_tag}
                        onChange={handleEditChange}
                        placeholder="tag1, tag2, tag3"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                      />
                      {editFormData.product_tag && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {formatTags(editFormData.product_tag).map((tag, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={editFormData.location}
                        onChange={handleEditChange}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="exhibitor_id" className="block text-sm font-medium text-gray-700">
                        Exhibitor ID
                      </label>
                      <input
                        type="text"
                        id="exhibitor_id"
                        name="exhibitor_id"
                        value={editFormData.exhibitor_id}
                        onChange={handleEditChange}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setEditingBrand(null)}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="relative h-48 mb-4">
              <Image
                src={brand.image_url}
                alt={brand.brand_name}
                fill
                className="rounded-lg object-cover"
              />
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {formatTags(brand.product_tag).map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm hover:bg-blue-200 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">
                  {brand.hall} - {brand.stand_number}
                </span>
              </div>

              <h2 className="text-xl font-semibold">{brand.brand_name}</h2>
              <p className="text-gray-600">{brand.description}</p>

              {/* Only show exhibitor info if exhibitor exists */}
              {brand.exhibitor && (
                <div className="flex items-center space-x-4 pt-4 border-t">
                  <div className="relative w-12 h-12">
                    <Image
                      src={brand.exhibitor.profile_picture}
                      alt={brand.exhibitor.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{brand.exhibitor.name}</p>
                    <p className="text-sm text-gray-500">{brand.exhibitor.position}</p>
                    <p className="text-sm text-gray-500">{brand.exhibitor.company}</p>
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500">
                Location: {brand.location}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}