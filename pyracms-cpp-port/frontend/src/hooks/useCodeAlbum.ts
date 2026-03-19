export interface CodeSnippetData {
  id: string
  title: string
  language: string
  code: string
  result: string
}

const PLACEHOLDER_SNIPPETS: CodeSnippetData[] = [
  {
    id: 'snippet-1',
    title: 'Fibonacci Sequence',
    language: 'python',
    code: `def fibonacci(n):
    """Generate Fibonacci sequence up to n terms."""
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result

print(fibonacci(10))`,
    result: '[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]',
  },
  {
    id: 'snippet-2',
    title: 'Quick Sort',
    language: 'python',
    code: `def quicksort(arr):
    """Sort array using quicksort algorithm."""
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

data = [3, 6, 8, 10, 1, 2, 1]
print(quicksort(data))`,
    result: '[1, 1, 2, 3, 6, 8, 10]',
  },
  {
    id: 'snippet-3',
    title: 'Caesar Cipher',
    language: 'python',
    code: `def caesar_encrypt(text, shift):
    """Encrypt text using Caesar cipher."""
    result = ""
    for char in text:
        if char.isalpha():
            base = ord('A') if char.isupper() else ord('a')
            result += chr((ord(char) - base + shift) % 26 + base)
        else:
            result += char
    return result

message = "Hello, World!"
encrypted = caesar_encrypt(message, 3)
print(f"Original:  {message}")
print(f"Encrypted: {encrypted}")`,
    result: `Original:  Hello, World!
Encrypted: Khoor, Zruog!`,
  },
  {
    id: 'snippet-4',
    title: 'Binary Search',
    language: 'python',
    code: `def binary_search(arr, target):
    """Find target in sorted array, return index or -1."""
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

sorted_list = [1, 3, 5, 7, 9, 11, 13, 15]
print(f"Index of 7: {binary_search(sorted_list, 7)}")
print(f"Index of 4: {binary_search(sorted_list, 4)}")`,
    result: `Index of 7: 3
Index of 4: -1`,
  },
]

export function useCodeAlbum(albumId: string) {
  const albumName = albumId
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  const snippets: CodeSnippetData[] = PLACEHOLDER_SNIPPETS

  return { albumName, snippets }
}
