# Next.js UI Components Example

This project contains a collection of UI components built with Next.js and TypeScript. The components are styled with Tailwind CSS and Radix UI primitives.

## Development

Install dependencies and start the development server:

```sh
pnpm install
pnpm dev
```

## Building

Create a production build with:

```sh
pnpm build
```

## Testing

This project uses [Vitest](https://vitest.dev/) for unit testing.
Run the test suite once:

```sh
pnpm test
```

Or watch files and re-run tests on change:

```sh
pnpm test:watch
```

### Manual TodoApp testing

The `TodoApp` component relies on interactive UI features that are difficult to automate. To test it manually, start the dev server:

```sh
pnpm dev
```

Open `http://localhost:3000` in a browser and verify adding, removing, filtering and sorting tasks works as expected.
