import React from "react"

/**
 * Denotes the directionality of an element's text
 *
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/dir
 */
type Directionality = "auto" | "ltr" | "rtl"

/**
 * Denotes the language of an element's text
 *
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang
 */
type Language = string

/**
 * Global attributes are attributes common to all HTML elements
 *
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
 */
export interface GlobalAttributes {
  className: string
  dir: Directionality
  lang: Language
}

/**
 * The <html> tag requires a "lang" property for accessibility reasons.
 *
 * **WCAG Success Criterion 3.1.1: Language of Page (Level A)**
 * > The default human language of each Web page can be programmatically
 * > determined.
 *
 * https://www.w3.org/TR/WCAG21/#language-of-page
 */
export type DocumentRequirements = "lang"

export type DocumentProps = Partial<GlobalAttributes> & Required<
  Pick<GlobalAttributes, DocumentRequirements>
>

export function Document(props: DocumentProps): React.ReactElement {
  return (
    <html {...props}>
    </html>
  )
}
