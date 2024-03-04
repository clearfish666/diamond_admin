import Vue from 'vue'
import { hasProp } from '@/utils'

export default function(images) {
  if (!images) return []

  images = typeof images === 'string' ? [{ file_url: images }] : images

  images = Array.isArray(images) ? images : [images]

  return images.map(image => {
    if (!hasProp(image, 'src')) {
      Vue.set(image, 'error', false)
      Vue.set(image, 'loading', false)
      Vue.set(image, 'src', image.file_url)
      Vue.set(image, 'success', !!image.file_url)
    }
    return image
  })
}
