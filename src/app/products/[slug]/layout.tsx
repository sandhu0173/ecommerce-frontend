import { Metadata, ResolvingMetadata } from 'next'
import { productApi } from '@/lib/api'

interface Props {
  params: Promise<{ slug: string }>
  children: React.ReactNode
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = (await params).slug

  try {
    // Fetch product data for metadata
    const response = await productApi.show(slug)
    const product = response.data.data

    const title = product.name
    const description = product.description?.substring(0, 160) || `Shop ${product.name} - Premium quality product with best prices`
    const imageUrl = product.image_url || 'https://shop.gurpreetsandhu.tech/og-image.jpg'

    return {
      title: `${product.name} | Premium Store`,
      description: description,
      keywords: [product.name, 'product', 'shop', 'online store'],
      openGraph: {
        title: product.name,
        description: description,
        url: `https://shop.gurpreetsandhu.tech/products/${slug}`,
        type: 'website',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: description,
        images: [imageUrl],
      },
      alternates: {
        canonical: `https://shop.gurpreetsandhu.tech/products/${slug}`,
      },
    }
  } catch (error) {
    return {
      title: 'Product | Premium Store',
      description: 'View product details on our premium online store',
    }
  }
}

export async function generateStaticParams() {
  try {
    const response = await productApi.list({ limit: 50 })
    const products = response.data.data

    return products.map((product: any) => ({
      slug: product.slug,
    }))
  } catch (error) {
    return []
  }
}

export default function ProductLayout({ children }: Props) {
  return <>{children}</>
}
