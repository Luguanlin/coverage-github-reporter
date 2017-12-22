const { resolve } = require('path')
const { Bot } = require('./bot')
const { parseFile } = require('./parse-coverage')
const { format } = require('./format-coverage')

exports.postComment = function postComment ({
  coverageJsonFilename = 'coverage/coverage-final.json',
  coverageHtmlRoot = 'coverage/lcov-report',
  defaultBaseBranch = 'master',
  root = process.cwd()
}) {
  const bot = Bot.create()

  const coverage = parseFile(root, resolve(root, coverageJsonFilename))

  const branch = bot.getBaseBranch(defaultBaseBranch)
  const { priorCoverage, priorBuild } = bot.getPriorBuild(branch, coverageJsonFilename)

  if (!priorCoverage) {
    console.log(`No prior coverage found`)
  }

  const result = JSON.parse(bot.comment(`
<a>
  <strong><a href="${bot.artifactUrl(`/${coverageHtmlRoot}/index.html`)}">Code Coverage</a></strong> 
  from Circle CI <a href="${process.env.CIRCLE_BUILD_URL}">build ${process.env.CIRCLE_BUILD_NUM}</a>
  ${priorBuild
    ? `(compared to <a href="${process.env.CIRCLE_BUILD_URL.replace(/\/\d+$/, `/${priorBuild}`)}">build ${priorBuild}</a> of <code>${branch}</code> branch)`
    : ''}

${format(coverage, priorCoverage, bot.artifactUrl(`/${coverageHtmlRoot}`))}
`))
  return result && result.html_url
}
