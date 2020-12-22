export FL_TITLE="Functional IO"
export FL_DESCRIPTION="IO methods as valid Task monads perfect to write great point-free software in JavaScript that is \
compatible with most modern browsers and Deno."
export FL_GITHUB_URL="https://github.com/sebastienfilion/functional-io"
export FL_DENO_URL="https://deno.land/x/functional_io"
export FL_VERSION="v1.1.0"

deno run --allow-all --unstable ../@functional:generate-documentation/cli.js document \
"$FL_TITLE" \
"$FL_DESCRIPTION" \
$FL_GITHUB_URL \
$FL_DENO_URL \
$FL_VERSION \
./.github/readme-fragment-usage.md \
./library/*.js \
./.github/readme-fragment-typescript.md \
./.github/readme-fragment-license.md
