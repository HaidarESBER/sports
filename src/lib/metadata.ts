import type { Metadata } from 'next'

const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
const siteName = 'SportPlan'
const siteDescription =
  'La plateforme de planification sportive qui vous aide à créer des séances personnalisées, suivre votre progression et partager vos entraînements avec la communauté.'

export const baseMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - Planifiez, Partagez, Progressez`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    'sport',
    'entraînement',
    'programme',
    'séance',
    'planification',
    'progression',
    'fitness',
    'course',
    'natation',
    'cyclisme',
    'musculation',
  ],
  authors: [{ name: 'SportPlan' }],
  creator: 'SportPlan',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteUrl,
    siteName,
    title: `${siteName} - Planifiez, Partagez, Progressez`,
    description: siteDescription,
    images: [
      {
        url: '/og-image.png', // You can add this later
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} - Planifiez, Partagez, Progressez`,
    description: siteDescription,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export function generateMetadata({
  title,
  description,
  image,
  noIndex = false,
}: {
  title?: string
  description?: string
  image?: string
  noIndex?: boolean
}): Metadata {
  return {
    ...baseMetadata,
    title: title ? `${title} | ${siteName}` : baseMetadata.title,
    description: description || baseMetadata.description,
    openGraph: {
      ...baseMetadata.openGraph,
      title: title ? `${title} | ${siteName}` : baseMetadata.openGraph?.title,
      description: description || baseMetadata.openGraph?.description,
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: title || siteName,
            },
          ]
        : baseMetadata.openGraph?.images,
    },
    twitter: {
      ...baseMetadata.twitter,
      title: title ? `${title} | ${siteName}` : baseMetadata.twitter?.title,
      description: description || baseMetadata.twitter?.description,
      images: image ? [image] : baseMetadata.twitter?.images,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : baseMetadata.robots,
  }
}
