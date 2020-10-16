const concurrently = require('nps-utils').concurrent.nps
const series = require('nps-utils').series.nps
module.exports = {
  scripts: {
    prerequisites: {
      default: concurrently('prerequisites.lint', 'prerequisites.build'),
      lint: {
        default: "eslint 'src/**/*.ts' 'test/**/*.ts'",
        fix: "eslint 'src/**/*.*' 'test/**/*.*' --fix"
      },
      build: 'rimraf dist'
    },
    database: {
      default: 'docker-compose up -d',
      teardown: 'docker-compose down -v'
    },
    build: {
      default: series('build.transpile', 'build.package'),
      transpile: 'tsc --module commonjs',
      package: 'rollup -c rollup.config.ts'
    },
    publish: {
      default: 'semantic-release',
      ciDryrun: 'semantic-release --dry-run',
      dryrun: "node-env-run -E ./secrets/publishing.env --exec 'semantic-release --dry-run",
      prepare: 'ts-node tools/semantic-release-prepare.ts'
    },
    coverage: {
      default: series('coverage.generate', 'coverage.report'),
      generate: 'jest --coverage --no-cache',
      report: 'cat ./coverage/lcov.info | coveralls'
    },
    default: 'rollup -c rollup.config.ts -w',
    test: {
      default: 'jest -runInBand --forceExit --detectOpenHandles --verbose',
      watch: 'jest -runInBand --forceExit --detectOpenHandles --verbose --watch'
    },
    maintenance: {
      default: series('maintenance.update_dependencies'),
      update_dependencies: {
        default: 'ncu',
        interactive: 'ncu -i -u'
      }
    }
  }
}
