# Playwright test tags

Run the tests from the project root with Playwright's `--grep` option.

## Available tags

The suite uses the following tags defined in `tests/tags.ts`:

- `@smoke`
- `@getProducts`
- `@negative scenarios`

## Run tests by tag

Examples:

```bash
npx playwright test --grep '@smoke'
npx playwright test --grep '@getProducts'
npx playwright test --grep '@negative scenarios'
```

## Run multiple tags

You can also combine tags with a regular expression:

```bash
npx playwright test --grep '@smoke|@getProducts'
```

If you want, you can later add npm scripts such as `test:smoke` for quicker commands.
