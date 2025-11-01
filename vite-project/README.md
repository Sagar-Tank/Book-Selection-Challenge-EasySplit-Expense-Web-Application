# EasySplit Expense Web Application

A beautiful, modern web application for splitting expenses among friends and family with multiple split methods and real-time settlement calculations.

## Features

✨ **Participant Management**: Add and remove participants by name  
💰 **Expense Entry**: Record expenses with descriptions, amounts, and payees  
🔀 **Multiple Split Methods**:
  - **Equal Split**: Divide amount equally among selected participants
  - **Unequal Split**: Custom amounts for each participant
  - **Proportional Split**: Assign shares/weights for proportional division  
📊 **Real-time Summary**: Clear settlement view showing who owes whom  
💾 **Data Persistence**: All data stored in Firebase Firestore  
🎨 **Modern UI**: Beautiful Material UI design with responsive layout  
🔄 **Context API**: Efficient state management with React Context  

## Tech Stack

- **React 19** with **TypeScript**
- **Vite** - Lightning-fast build tool
- **Material UI v7** - Modern component library
- **Firebase Firestore** - Cloud database
- **Context API** - State management

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase account

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Get your Firebase configuration
   - Update `src/firebase/config.ts` with your configuration

3. Run the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Firebase Setup

See detailed instructions in `src/firebase/README.md`

## Project Structure

```
src/
├── components/
│   ├── ParticipantManager.tsx    # Add/remove participants
│   ├── ExpenseEntry.tsx          # Expense form with all split methods
│   ├── ExpenseList.tsx           # Display all expenses
│   └── SummaryView.tsx           # Settlement summary
├── context/
│   └── ExpenseContext.tsx        # State management
├── firebase/
│   ├── config.ts                 # Firebase configuration
│   └── README.md                 # Firebase setup guide
├── types/
│   └── index.ts                  # TypeScript type definitions
├── App.tsx                       # Main application component
└── main.tsx                      # Application entry point
```

## Usage

1. **Add Participants**: Click on "Participants" section and add people who will split expenses
2. **Add Expense**: 
   - Enter description, amount, and payee
   - Choose split method (Equal/Unequal/Proportional)
   - Select participants
   - Click "Add Expense"
3. **View Summary**: Check "Settlement Summary" to see who owes whom
4. **Manage**: View all expenses and delete them if needed

## Contributing

This is a practical project for learning React, TypeScript, Material UI, and Firebase.

## License

MIT

---

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
