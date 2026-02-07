import { parseSync } from 'oxc-parser'

const normalizeNode = node => {
  if (!node || typeof node !== 'object') {
    return node
  }

  if (typeof node.start !== 'number') {
    const span = node.span
    if (span && typeof span.start === 'number') {
      node.start = span.start
    }
  }

  if (typeof node.end !== 'number') {
    const span = node.span
    if (span && typeof span.end === 'number') {
      node.end = span.end
    }
  }

  return node
}

const isNodeLike = value => {
  return Boolean(value && typeof value === 'object' && typeof value.type === 'string')
}

const walk = (node, visit) => {
  if (!isNodeLike(node)) {
    return
  }

  visit(node)

  for (const value of Object.values(node)) {
    if (!value) {
      continue
    }

    if (Array.isArray(value)) {
      for (const entry of value) {
        if (isNodeLike(entry)) {
          walk(entry, visit)
        }
      }
      continue
    }

    if (isNodeLike(value)) {
      walk(value, visit)
    }
  }
}

const parse = source => {
  const astComments = []
  const importExpressionNodes = []
  const {
    program,
    comments = [],
    errors = []
  } = parseSync('inline.jsx', source, {
    lang: 'jsx',
    sourceType: 'module',
    range: true,
    preserveParens: true
  })

  if (errors.length > 0) {
    const first = errors[0]
    const message = first && typeof first.message === 'string' ? first.message : ''
    throw new Error(message ? `[oxc-parser] ${message}` : '[oxc-parser] Parse error')
  }

  for (const comment of comments) {
    const kind = comment.type ?? comment.kind
    if (kind !== 'Block') {
      continue
    }
    const start = comment.start ?? comment.span?.start
    const end = comment.end ?? comment.span?.end
    const text = comment.value ?? comment.text ?? comment.content ?? ''

    if (typeof start === 'number' && typeof end === 'number') {
      astComments.push({ start, end, text })
    }
  }

  walk(program, node => {
    if (node.type !== 'ImportExpression') {
      return
    }

    const normalizedNode = normalizeNode(node)
    const normalizedSource = normalizeNode(node.source)

    if (
      !normalizedSource ||
      typeof normalizedSource.start !== 'number' ||
      typeof normalizedSource.end !== 'number'
    ) {
      return
    }

    importExpressionNodes.push({
      ...normalizedNode,
      source: normalizedSource
    })
  })

  return { ast: program, astComments, importExpressionNodes, source }
}

export { parse }
