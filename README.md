# Custody Calculator

A precision legal tool that helps divorced or separated parents design, visualize, and calculate parenting time schedules.

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd custody-calculator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 5173 |
| `npm run build` | Build for production (TypeScript compile + Vite build) |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest unit tests |

## Technology Stack

- **Build:** Vite 6.0+
- **Framework:** React 18.3+ with TypeScript 5.6+ (strict mode)
- **Styling:** Tailwind CSS 3.4+ (utility-first)
- **Icons:** lucide-react 0.460+
- **Testing:** Vitest

## Documentation

See [CONTEXT.md](./CONTEXT.md) for detailed domain knowledge, architecture rationale, and implementation guidelines.
