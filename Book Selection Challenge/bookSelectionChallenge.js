// Problem Statement:

// Ravi enters a bookstore that offers N different types of books. Each book costs the same. Ravi has enough money to buy exactly K books.

// You need to determine how many different combinations of books Ravi can purchase if there are infinite copies of each type of book available.

// Input Format

// The first line contains an integer T, the number of test cases.

// Each test case consists of two lines:

// The first line contains an integer N – the number of book types.

// The second line contains an integer K – the number of books Ravi wants to buy.

// Output Format

// For each test case, print the number of ways Ravi can buy the books.
// If the answer has more than 9 digits, print only the last 9 digits of the answer.

// Constraints

// 1 ≤ T ≤ 200
// 1 ≤ N < 1000
// 1 ≤ K < 1000


// Example Input

// 2
// 4
// 1
// 2
// 3

// Example Output

// 4
// 4

// Explanation

// Test case 1:
// N = 4 (book types), K = 1 (books to buy).
// Ravi can buy any one of the 4 available types of books.
// → Total ways = 4.

// Test case 2:
// N = 2 (book types), K = 3 (books to buy).
// If we name the books as A and B, the combinations are:

// AAA
// AAB
// ABB
// BBB

// Total ways = 4.

// This function calculates: "How many ways to choose r items from n items"
function calculateCombinations(totalItems, itemsToChoose, modulo) {
    // Step 1: Handle simple cases first
    if (itemsToChoose > totalItems) {
        return 0; // Can't choose more items than available
    }
    if (itemsToChoose === 0 || itemsToChoose === totalItems) {
        return 1; // Only 1 way: choose nothing or choose everything
    }

    // Step 2: Use the smaller number for efficiency
    if (itemsToChoose > totalItems - itemsToChoose) {
        itemsToChoose = totalItems - itemsToChoose;
    }

    const answer = Array.from({ length: itemsToChoose }, (_, i) => i).reduce((acc, i) => {
        // Multiply by (totalItems - i), then divide by (i + 1)
        return (acc * BigInt(totalItems - i)) / BigInt(i + 1);
    }, 1n); // Start with 1n (BigInt 1)

    // We use modulo (remainder after division) to get last 9 digits
    const lastNineDigits = Number(answer % BigInt(modulo));
    return lastNineDigits;
}

// This function reads the input and solves each test case
function processInput(inputLines) {
    // This number is used to get only the last 9 digits of big answers
    const MOD = 1000000000; // That's 1 followed by 9 zeros

    // Read the number of test cases (first line)
    const numberOfTestCases = parseInt(inputLines[0]);

    // Skip the first line (index 0), then process each test case
    // Each test case takes 2 lines: N and K
    const answers = Array.from({ length: numberOfTestCases }, (_, testCaseIndex) => {
        // Calculate which line index we're at
        const lineIndex = 1 + (testCaseIndex * 2);

        // Read N (number of book types)
        const numberOfBookTypes = parseInt(inputLines[lineIndex]);

        // Read K (number of books to buy)
        const numberOfBooksToBuy = parseInt(inputLines[lineIndex + 1]);

        // THE KEY FORMULA: When you can repeat items (infinite copies),
        // the number of ways = C(N + K - 1, K)
        // This is called the "stars and bars" formula

        const total = numberOfBookTypes + numberOfBooksToBuy - 1;
        const choose = numberOfBooksToBuy;

        // Calculate and return the answer for this test case
        return calculateCombinations(total, choose, MOD);
    });

    return answers;
}

// Main function to solve the book selection challenge
function bookSelectionChallenge(inputLines) {
    const results = processInput(inputLines);
    results.forEach(result => console.log(result));
    return results;
}

// Example test cases
const testInput = [
    '2',
    '4',
    '1',
    '2',
    '3'
];

// Run test
console.log('Test Output:');
bookSelectionChallenge(testInput);
