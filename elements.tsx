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

export interface Children<Type = React.ReactElement> {
  children?: Type
}

export type HeadProps = Partial<GlobalAttributes>
  & Children<React.ReactNode>

export type BodyProps = Partial<GlobalAttributes>
  & Children<React.ReactNode>

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

export type DocumentProps = Partial<GlobalAttributes>
  & Required<Pick<GlobalAttributes, DocumentRequirements>>
  & { title: string }
  & Children<[
    React.ReactElement<HeadProps>,
    React.ReactElement<BodyProps>,
  ] | React.ReactElement<BodyProps>>

const DocumentContext = React.createContext({
  title: "",
})

export function Document(props: DocumentProps): React.ReactElement {
  const { title, ...html } = props
  const children: any = props.children
  const headAndBody = children.length === 2
    && children[0].type === Head
    && children[1].type === Body 
  const bodyOnly = !headAndBody
    && children.type === Body
  return (
    <DocumentContext.Provider value={{ title }}>
      <html {...html}>
        {headAndBody ? (
          <>{children}</>
        ) : bodyOnly ? (
          <>
            <Head></Head>
            {props.children}
          </>
        ) : (
          <>
            <Head></Head>
            <Body>{props.children}</Body>
          </>
        )}
      </html>
    </DocumentContext.Provider>
  )
}

export function Head(props: HeadProps): React.ReactElement {
  const { title } = React.useContext(DocumentContext)
  return (
    <head {...props}>
      <meta charSet="utf-8" />
      <title>{ title }</title>
      {props.children}
    </head>
  )
}

export function Body(props: BodyProps): React.ReactElement {
  return <body {...props} />
}
