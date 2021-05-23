import React from "react"

export type HeadProps = React.HTMLAttributes<HTMLHeadElement>

export type BodyProps = React.HTMLAttributes<HTMLBodyElement>

export type SpanProps = React.HTMLAttributes<HTMLSpanElement>

/**
 * The <html> tag requires a "lang" property for accessibility reasons.
 *
 * **WCAG Success Criterion 3.1.1: Language of Page (Level A)**
 * > The default human language of each Web page can be programmatically
 * > determined.
 *
 * https://www.w3.org/TR/WCAG21/#language-of-page
 */
export type DocumentRequirements = "lang" | "title"

export type DocumentProps = React.HTMLAttributes<HTMLHtmlElement>
  & Required<Pick<HTMLHtmlElement, DocumentRequirements>>

const LanguageContext = React.createContext<React.MutableRefObject<string>>(undefined)
const TitleContext = React.createContext("")

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

const HeadingLevelContext = React.createContext<React.MutableRefObject<HeadingLevel>>(undefined)

function HeadingLevelProvider({ children }): React.ReactElement {
  const level = React.useRef(1 as HeadingLevel)
  return (
    <HeadingLevelContext.Provider value={level}>
      {children}
    </HeadingLevelContext.Provider>
  )
}

function LanguageProvider({ children, lang }): React.ReactElement {
  const langRef = React.useRef(lang)
  return (
    <LanguageContext.Provider value={langRef}>
      {children}
    </LanguageContext.Provider>
  )
}

const withLanguage = Component => props => {
  const langContext = React.useContext(LanguageContext)
  const { lang, children, ...rest } = props

  if (lang === langContext.current) {
    return <Component {...rest} />
  } else if (children) {
    return (
      <Component {...rest} lang={lang}>
        <LanguageProvider lang={lang}>
          {children}
        </LanguageProvider>
      </Component>
    )
  } else {
    return <Component {...rest} lang={lang} />
  }
}

export type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
  level?: HeadingLevel
}

export const Heading: React.FC<HeadingProps> = withLanguage(props => {
  const langContext = React.useContext(LanguageContext)
  const headingLevel = React.useContext(HeadingLevelContext)

  const {
    level: newLevel,
    ...heading
  } = props

  const level = newLevel || headingLevel.current
  const levelChange = Math.abs(level - headingLevel.current)
  if (levelChange > 1) {
    throw new Error(
      `Heading level ${level} not allowed: previous level is ${headingLevel.current}`
    )
  }

  headingLevel.current = level
  const Element = `h${level}`
  return <Element {...heading} />
})

export const Document: React.FC<DocumentProps> = props => {
  const { title, ...html } = props
  const children: any = props.children
  const emptyBody = children === undefined
  const headAndBody = !emptyBody
    && children.length === 2
    && children[0].type === Head
    && children[1].type === Body 
  const headOnly = !headAndBody
    && children?.type === Head
  const bodyOnly = !headAndBody
    && children?.type === Body
  return (
    <HeadingLevelProvider>
    <LanguageProvider lang={props.lang}>
      <TitleContext.Provider value={title}>
        <html {...html}>
          {emptyBody ? (
            <>
              <Head></Head>
              <Body>{" "}</Body>
            </>
          ) : headAndBody ? (
            <>{children}</>
          ) : headOnly ? (
            <>
              {props.children}
              <Body>{" "}</Body>
            </>
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
      </TitleContext.Provider>
    </LanguageProvider>
    </HeadingLevelProvider>
  )
}

export const Head: React.FC<HeadProps> = props => {
  const title = React.useContext(TitleContext)
  return (
    <head {...props}>
      <meta charSet="utf-8" />
      <title>{ title }</title>
      {props.children}
    </head>
  )
}

export const Body: React.FC<BodyProps> = props => {
  return <body {...props} />
}

export const Span: React.FC<SpanProps> = withLanguage(props => {
  return <span {...props} />
})
