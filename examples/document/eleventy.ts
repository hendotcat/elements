import { rehypePlugin } from "@hendotcat/11tyhype"
import { reactPlugin } from "@hendotcat/11tysnap"
import format from "rehype-format"

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(reactPlugin)
  eleventyConfig.addPlugin(rehypePlugin, {
    plugins: [
      [format],
    ]
  })
}
