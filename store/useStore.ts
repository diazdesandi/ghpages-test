import { defineStore } from 'pinia'
import type { Target } from '@/interfaces/csv.interface';

// Create store for handling two csv files

interface StoreState {
  csv1: string | null;
  csv2: string | null;
}

export const useStore = defineStore('store', {
  state: (): StoreState => ({
    csv1: null,
    csv2: null
  }),
  
  actions: {
    /**
     * Load a CSV file and store its content
     * @param file - The CSV file to load
     * @param target - Which store slot to use (csv1 or csv2)
     * @returns Promise that resolves when file is loaded
     */
    loadCsv(file: File, target: Target): Promise<void> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const text = e.target?.result as string;
          if (text) {
            this[target] = text;
            resolve();
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Error reading file'));
        };
        
        reader.readAsText(file);
      });
    },
    
    /**
     * Get valid headers from CSV rows
     * @param rows - CSV rows
     * @returns Object containing headers and startIndex for data
     */
    getValidHeaders(rows: string[]): { headers: string[], startIndex: number } {
      let headerIndex = 0;

      // Iterate through rows to find the first non-empty row with comma-separated values
      while (headerIndex < rows.length) {
        const rowContent = rows[headerIndex]?.trim();

        // Check if the row is not empty, does not consist only of periods, and contains commas
        if (rowContent && rowContent !== '.' && !/^\.+$/.test(rowContent) && rowContent.includes(',')) {
          break;
        }
        headerIndex++;
      }

      // If we couldn't find a valid header, use an empty array
      const headers = headerIndex < rows.length ? rows[headerIndex].split(',') : [];

      return {
        headers,
        startIndex: headerIndex + 1 // Data starts after the header row
      };
    },
    
    /**
     * Compare two CSV files and return differences
     * @returns Array of differences between CSV1 and CSV2
     */
    compareCsv() {
      if (!this.csv1 || !this.csv2) {
        return null;
      }
      
      const rows1 = this.csv1.split('\n');
      const rows2 = this.csv2.split('\n');
      
      const { headers, startIndex: startIndex1 } = this.getValidHeaders(rows1);
      const { startIndex: startIndex2 } = this.getValidHeaders(rows2);
      
      // Extract data without headers
      const data1 = rows1.slice(startIndex1).filter(row => row.trim());
      const data2 = rows2.slice(startIndex2).filter(row => row.trim());
      
      // Find rows in csv1 that don't exist in csv2
      const onlyInCsv1 = data1.filter(row1 => !data2.some(row2 => row1 === row2));
      
      // Find rows in csv2 that don't exist in csv1
      const onlyInCsv2 = data2.filter(row2 => !data1.some(row1 => row1 === row2));
      
      return {
        headers,
        onlyInCsv1,
        onlyInCsv2
      };
    },
    
    /**
     * Get the intersection between two CSV files
     * @returns Array of rows common to both CSV files
     */
    getIntersection() {
      if (!this.csv1 || !this.csv2) {
        return null;
      }
      
      const rows1 = this.csv1.split('\n');
      const rows2 = this.csv2.split('\n');
      
      const { headers, startIndex: startIndex1 } = this.getValidHeaders(rows1);
      const { startIndex: startIndex2 } = this.getValidHeaders(rows2);
      
      // Extract data without headers
      const data1 = rows1.slice(startIndex1).filter(row => row.trim());
      const data2 = rows2.slice(startIndex2).filter(row => row.trim());
      
      // Find rows that exist in both CSVs
      const intersection = data1.filter(row1 => data2.some(row2 => row1 === row2));
      
      return {
        headers,
        intersection
      };
    }
  }
})

// Function to compare two csv files
function compareCsv(csv1: string, csv2: string) {
  const rows1 = csv1.split('\n')
  const rows2 = csv2.split('\n')
}

// Function to get the difference between two csv files
function getDifference(csv1: string, csv2: string) {
  const rows1 = csv1.split('\n')
  const rows2 = csv2.split('\n')
}

// Function to get the intersection between two csv files
function getIntersection(csv1: string, csv2: string) {
  const rows1 = csv1.split('\n')
  const rows2 = csv2.split('\n')
}

