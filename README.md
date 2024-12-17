# NextGlobeGen

NextGlobeGen is a NPM package designed to streamline the process of adding internationalization (i18n) to your Next.js application, specifically tailored for projects using the Next.js App Router. By leveraging generative programming techniques, NextGlobeGen automates the creation of locale-based routes, enabling a seamless developer experience for the developers.

Whether you're building a blog, an e-commerce platform, or an enterprise application, NextGlobeGen is your go-to tool for making your Next.js app globally ready.

[Check out the Docs](https://jon1vk.github.io/NextGlobeGen/)

## Key Features

- **Generative Locale Routes**: Includes CLI tool that generates routes for each supported language.
- **Middleware Integration**: Provides pre-configured middleware for locale detection and redirection.
- **Translation Logic**: Supports ICU formatted interpolation patterns in the tranlations.
- **Developer-Friendly**: Includes a locale-aware API that works interchangeably in server and client components.

## How It Works

NextGlobeGen uses the power of generative programming to create the localized routes. It:

- Analyzes your app routing structure.
- Generates localized routes based on the analysis.
- Supports TypeScript by generating the required types.
- Provides API that is automacigally aware of the current locale.