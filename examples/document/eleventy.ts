import { rehypePlugin } from "@henrycatalinismith/11tyhype"
import { reactPlugin } from "@henrycatalinismith/11tysnap"
import format from "rehype-format"

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(reactPlugin)
  eleventyConfig.addPlugin(rehypePlugin, {
    plugins: [
      [format],
    ]
  })
}
