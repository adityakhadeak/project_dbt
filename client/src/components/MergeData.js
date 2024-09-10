import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import * as XLSX from 'xlsx';
import Fuse from 'fuse.js';
import BeatLoader from 'react-spinners/BeatLoader';

const MergedData = () => {
    const [loading, setLoading] = useState(false);
    const [color, setColor] = useState('#1b3058');
    const [mergedData, setMergedData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const css = {
        display: 'block',
        margin: '0 auto',
        borderColor: 'red',
    };

    const formik = useFormik({
        initialValues: {
            file1: null,  // College File
            file2: null,  // DBT File
        },
        validateOnBlur: false,
        validateOnChange: false,
        validationSchema: Yup.object({
            file1: Yup.mixed().required('College file is required'),
            file2: Yup.mixed().required('DBT file is required'),
        }),
        onSubmit: async (values, actions) => {
            try {
                setLoading(true);

                const collegeData = await readMultipleSheets(values.file1);
                const dbtData = await readDBTSheets(values.file2);

                await mergeData(collegeData, dbtData);

                setLoading(false);
                actions.resetForm();
            } catch (error) {
                console.error('Error processing files:', error);
            }
        },
    });

    const handleFileChange = (event) => {
        const { name, files } = event.target;
        formik.setFieldValue(name, files[0]);
    };

    const readMultipleSheets = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const workbook = XLSX.read(e.target.result, { type: 'binary' });
                let allData = [];
                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    allData.push(...jsonData);
                });
                resolve(allData);
            };
            reader.onerror = (error) => reject(error);
            reader.readAsBinaryString(file);
        });
    };

    const readDBTSheets = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const workbook = XLSX.read(e.target.result, { type: 'binary' });
                let combinedData = {};

                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    const [header, ...rows] = jsonData;

                    // Create a Set to store unique combinations (to eliminate duplicates)
                    const seenEntries = new Set();

                    rows.forEach(row => {
                        // console.log(row[header.indexOf('Scheme')]);  // Check what is returned for the 'Scheme' column

                        const name = standardizeName(row[header.indexOf('Beneficiary Name')]);
                        const disbursedAmount = parseFloat(row[header.indexOf('Disbursed Amount(₹)')]) || 0;
                        const scheme = row[header.indexOf('Scheme')];
                        // console.log(scheme)
                        const applicationNo = row[header.indexOf('Application No')];

                        // Create a unique key to check for duplicates based on 'name', 'scheme', and 'applicationNo'
                        const uniqueKey = `${name}-${scheme}-${applicationNo}`;
                        const uniqueKey1 = `${name}-${scheme}`;

                        // Only process if the unique key has not been seen before
                        if (!seenEntries.has(uniqueKey)) {
                            seenEntries.add(uniqueKey);  // Add key to the set to avoid duplicates

                            if (!combinedData[uniqueKey1]) {
                                combinedData[uniqueKey1] = {
                                    disbursedAmount: 0,
                                    scheme,
                                    applicationNo,
                                };
                            }
                            console.log('Combined Data for:', name, combinedData[uniqueKey1]);  // Log to check

                            combinedData[uniqueKey1].disbursedAmount += disbursedAmount;
                        }
                    });
                });
                console.log("DBT Data:", combinedData);  // Log DBT data to inspect if scheme exists

                resolve(combinedData);
            };
            reader.onerror = (error) => reject(error);
            reader.readAsBinaryString(file);
        });
    };


    const standardizeName = (name) => {
        if (!name) return '';
        const parts = name.trim().split(/\s+/).sort();
        return parts.join(' ');
    };

    const mergeData = async (collegeData, dbtData) => {
        const [collegeHeader, ...collegeRows] = collegeData;

        // Indices for College file
        const nameIndexCollege = collegeHeader.indexOf('Name');
        const admissionNoIndexCollege = collegeHeader.indexOf('Admission No.');
        const batchIndexCollege = collegeHeader.indexOf('Batch');
        const yearIndexCollege = collegeHeader.indexOf('Year');
        const dueAmountIndexCollege = collegeHeader.indexOf('Due Amount');

        const fuse = new Fuse(Object.keys(dbtData).map(name => ({ name })), {
            keys: ['name'],
            includeScore: true,
            threshold: 0.25,
        });

        const merged = collegeRows.map(row => {
            const nameCollege = standardizeName(row[nameIndexCollege]?.toString().trim());
            const admissionNo = row[admissionNoIndexCollege];
            const batch = row[batchIndexCollege];
            const year = row[yearIndexCollege];
            const dueAmount = parseFloat(row[dueAmountIndexCollege]) || 0;

            const bestMatch = fuse.search(nameCollege)[0]?.item || {};
            const dbtDataEntry = dbtData[bestMatch.name] || {};
            const disbursedAmount = dbtDataEntry.disbursedAmount || 0;
            const remainingAmount = dueAmount - disbursedAmount;

            if (!Object.keys(dbtDataEntry).length) return null;

            return [
                row[nameIndexCollege],
                admissionNo,
                batch,
                year,
                dbtDataEntry.scheme || '',
                dbtDataEntry.applicationNo || '',
                dueAmount,
                disbursedAmount,
                remainingAmount,
            ];
        }).filter(row => row !== null); // Remove null rows

        const finalHeader = [
            'Name', 'Admission No', 'Batch', 'Year', 'Scheme', 'Application No', 'To be Paid', 'Disbursed Amount', 'Remaining Amount',
        ];
        setMergedData([finalHeader, ...merged]);
    };

    const handleDownload = () => {
        const worksheet = XLSX.utils.aoa_to_sheet(mergedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const excelBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        const downloadLink = URL.createObjectURL(excelBlob);
        const link = document.createElement('a');
        link.href = downloadLink;
        link.download = 'merged_data.xlsx';
        link.click();

        setTimeout(() => {
            URL.revokeObjectURL(downloadLink);
        }, 100);
    };

    const handleSearch = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);

        const filteredData = mergedData.filter((row, index) => {
            if (index === 0) return true; // Include header row
            return row.some(cell => cell.toString().toLowerCase().includes(query));
        });

        setSearchResults(filteredData);
    };

    return (
        <Box bg={'#f4f6f8'} padding={'10px'}>
            <Box display={'flex'} alignItems={'center'} justifyContent={'center'}>Merge Data</Box>
            <Box display={'flex'} flexDirection={'row'} justifyContent={'center'} alignItems={'center'}>
                <form onSubmit={formik.handleSubmit}>
                    <FormControl isInvalid={formik.errors.file1} p='2px' my='5px'>
                        <FormLabel>College file</FormLabel>
                        <Input name='file1' onChange={handleFileChange} onBlur={formik.handleBlur} py={'5px'} type='file' />
                        <FormErrorMessage>{formik.errors.file1}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={formik.errors.file2} p='2px' my='5px'>
                        <FormLabel>DBT file</FormLabel>
                        <Input name='file2' onChange={handleFileChange} onBlur={formik.handleBlur} py={'5px'} type='file' />
                        <FormErrorMessage>{formik.errors.file2}</FormErrorMessage>
                    </FormControl>

                    <Box display={'flex'} justifyContent={'center'} alignItems={'center'}>
                        <Button mt={4} colorScheme='teal' isLoading={formik.isSubmitting} type='submit'>
                            Submit
                        </Button>
                    </Box>
                </form>
            </Box>

            {mergedData.length > 0 && (
                <Box display={'flex'} justifyContent={'center'} alignItems={'center'} mt={4}>
                    <FormControl width={'500px'}>
                        <FormLabel>Search by name or admission number</FormLabel>
                        <Input width={'500px'} placeholder="Search by name or admission number" value={searchQuery} onChange={handleSearch} />
                    </FormControl>
                </Box>
            )}

            <Box my={'50px'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                <BeatLoader color={color} loading={loading} cssOverride={css} size={25} />
            </Box>

            {mergedData.length > 0 && (
                <Box display={'flex'} justifyContent={'center'} alignItems={'center'} flexDirection={'column'}>
                    <Box maxHeight={'500px'} overflowY={'scroll'}>
                        <Table variant='striped' size={'sm'}>
                            <Thead bg={'blue.500'} position='sticky' top={0} zIndex={1}>
                                <Tr>
                                    {mergedData[0].map((header, idx) => (
                                        <Th key={idx} color={'white'}>{header}</Th>
                                    ))}
                                </Tr>
                            </Thead>
                            <Tbody>
                                {(searchQuery ? searchResults : mergedData.slice(1)).map((row, idx) => (
                                    <Tr key={idx}>
                                        {row.map((cell, cellIdx) => (
                                            <Td key={cellIdx}>{cell}</Td>
                                        ))}
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>
                    <Button onClick={handleDownload} colorScheme='teal' mt={4}>
                        Download Merged Data
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default MergedData;
