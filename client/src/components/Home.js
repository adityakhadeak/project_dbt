import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import { useFormik } from 'formik'
import React, { useContext, useEffect, useState, CSSProperties } from 'react'
import * as Yup from 'yup'
import * as XLSX from 'xlsx'
import Fuse from 'fuse.js'
import UserContext from '../context/UserContext.js'
import { useNavigate } from 'react-router-dom'
import BeatLoader from "react-spinners/BeatLoader";

const Home = () => {
    let [loading, setLoading] = useState(false);
    let [color, setColor] = useState("#1b3058");
    const navigate = useNavigate()
    const [mergedData, setMergedData] = useState([])
    const [file1Data, setFile1Data] = useState([])
    const [file2Data, setFile2Data] = useState([])

    const css = {
        display: "block",
        margin: "0 auto",
        borderColor: "red",
    };
    const feeMapping = {
        'First Year': 124000,
        'Second Year': 137054,
        'Third Year': 129054,
        'Fourth Year': 130554
    };

    // useEffect(() => {
    //     if (!isLoggedIn) {
    //         navigate('/login')
    //     }
    //     console.log(isLoggedIn)
    // }, [user,isLoggedIn])
    useEffect(() => {
        console.log(mergedData)
    }, [mergedData])


    const standardizeName = (name) => {
        if (!name) return '';

        const parts = name.trim().split(/\s+/).sort();
        const newName = parts.join(' ');
        console.log(newName)
        return newName
    };

    const formik = useFormik({
        initialValues: {
            file1: null,
            file2: null,
        },
        validateOnBlur: false,
        validateOnChange: false,
        validationSchema: Yup.object({
            file1: Yup.mixed().required("File 1 is required"),
            file2: Yup.mixed().required("File 2 is required"),
        }),
        onSubmit: async (values, actions) => {
            try {
                setLoading(true)

                const file1 = await readFileData(values.file1)
                const file2 = await readFileData(values.file2)

                setFile1Data(file1)
                setFile2Data(file2)

                await mergeData(file1, file2)

                setLoading(false)

                actions.resetForm()
            } catch (error) {
                console.error("Error reading files:", error)
            }
        },
    })

    const handleFileChange = (event) => {
        const { name, files } = event.target
        formik.setFieldValue(name, files[0])
    }

    const readFileData = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                const workbook = XLSX.read(e.target.result, { type: 'binary' })
                const firstSheetName = workbook.SheetNames[0]
                const worksheet = workbook.Sheets[firstSheetName]
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
                resolve(jsonData)
            }
            reader.onerror = (error) => reject(error)
            reader.readAsBinaryString(file)
        })
    }

    const mergeData = async (data1, data2) => {
        const [header1, ...rows1] = data1
        const [header2, ...rows2] = data2

        // Indices of relevant columns
        const nameIndex1 = header1.indexOf('Name')
        const admissionNoIndex1 = header1.indexOf('Admission No')
        const yearNameIndex1 = header1.indexOf('YearName')

        const nameIndex2 = header2.indexOf('Beneficiary Name')
        const schemeIndex2 = header2.indexOf('Scheme')
        const applicationNoIndex2 = header2.indexOf('Application No')
        const courseIndex2 = header2.indexOf('Course')
        const disbursedAmountIndex2 = header2.indexOf('Disbursed Amount(₹)')

        if (nameIndex1 === -1 || admissionNoIndex1 === -1 || yearNameIndex1 === -1 ||
            nameIndex2 === -1 || schemeIndex2 === -1 || applicationNoIndex2 === -1 ||
            courseIndex2 === -1 || disbursedAmountIndex2 === -1) {
            console.error("Invalid column indices. Please check header names.")
            return
        }

        const flattenedData2 = rows2.map(row => ({
            name: standardizeName(row[nameIndex2]?.toString().trim()),
            disbursedAmount: parseFloat(row[disbursedAmountIndex2]) || 0,
            scheme: row[schemeIndex2],
            applicationNo: row[applicationNoIndex2],
            course: row[courseIndex2],
        }))


        console.log(flattenedData2)
        const fuse = new Fuse(flattenedData2, { keys: ["name"], includeScore: true, threshold: 0.25 })

        const merged = rows1.map(row1 => {
            const name1 = standardizeName(row1[nameIndex1]?.toString().trim())
            console.log(name1)
            const yearName = row1[yearNameIndex1];
            console.log(fuse.search(name1)[0]?.item || {})
            const bestMatch = fuse.search(name1)[0]?.item || {};

            const totalFee = feeMapping[yearName] || 0;
            const disbursedAmount = bestMatch.disbursedAmount || 0;
            const remainingFee = totalFee - disbursedAmount;
            if (bestMatch == {}) return null
            return [
                name1,
                row1[admissionNoIndex1],
                yearName,
                bestMatch.scheme || '',
                bestMatch.applicationNo || '',
                bestMatch.course || '',
                disbursedAmount,
                remainingFee
            ];
        });


        const finalHeader = [
            'Name', 'Admission_No', 'YearName',
            'Scheme', 'Application_No', 'Course', 'Disbursed_Amount', 'Remaining_Fee'
        ]
        setMergedData([finalHeader, ...merged])

    }


    const handleDownload = () => {
        const worksheet = XLSX.utils.aoa_to_sheet(mergedData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
        const excelBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

        const downloadLink = URL.createObjectURL(excelBlob)
        const link = document.createElement('a')
        link.href = downloadLink
        link.download = "merged_data.xlsx"
        link.click()

        setTimeout(() => {
            URL.revokeObjectURL(downloadLink)
        }, 100)
    }


    return (
        <Box padding={'10px'}>
            <Box display={'flex'} flexDirection={'row'} justifyContent={'center'} alignItems={'center'}>
                <form onSubmit={formik.handleSubmit}>
                    <FormControl isInvalid={formik.errors.file1} p='2px' my='5px'>
                        <FormLabel>College file</FormLabel>
                        <Input
                            name='file1'
                            onChange={handleFileChange}
                            onBlur={formik.handleBlur}
                            py={'5px'}
                            type='file'
                        />
                        <FormErrorMessage>{formik.errors.file1}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={formik.errors.file2} p='2px' my='5px'>
                        <FormLabel>DBT file</FormLabel>
                        <Input
                            name='file2'
                            onChange={handleFileChange}
                            onBlur={formik.handleBlur}
                            py={'5px'}
                            type='file'
                        />
                        <FormErrorMessage>{formik.errors.file2}</FormErrorMessage>
                    </FormControl>

                    <Box display='flex' justifyContent={'center'} alignItems={'center'} width='100%' py='10px' my='20px'>
                        <Button width='90%' height='45px' borderRadius='20px' colorScheme='linkedin' type='submit'>Submit</Button>
                    </Box>
                </form>
            </Box>
            <Box display={'flex'} justifyContent={'center'} alignItems={'center'}>
                <BeatLoader
                    color={color}
                    loading={loading}
                    cssOverride={css}
                    size={10}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                />
            </Box>
            {mergedData.length > 0 && (

                <Box mt='20px'>
                    <Box display='flex' justifyContent={'center'} alignItems={'center'} width='100%' py='10px' my='20px'>
                        <Button width='20%' height='45px' borderRadius='20px' colorScheme='blue' onClick={handleDownload}>
                            Download Merged Data
                        </Button>
                    </Box>
                    <Table variant="simple" mt="4">
                        <Thead>
                            <Tr>
                                <Th>Name</Th>
                                <Th>Admission No</Th>
                                <Th>YearName</Th>
                                <Th>Scheme</Th>
                                <Th>Application No</Th>
                                <Th>Course</Th>
                                <Th>Disbursed Amount</Th>
                                <Th>Remaining Fee</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {mergedData.slice(1).map((row, index) => (
                                <Tr key={index}>
                                    {row.map((cell, cellIndex) => (
                                        <Td key={cellIndex}>{cell}</Td>
                                    ))}
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>


                </Box>
            )}
        </Box>
    )
}

export default Home 