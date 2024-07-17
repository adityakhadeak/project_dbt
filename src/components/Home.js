import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import * as Yup from 'yup';
import * as XLSX from 'xlsx';

const Home = () => {
    const [file1Data, setfile1Data] = useState([])
    const [file2Data, setfile2Data] = useState([])
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
                const file1Data = await readFileData(values.file1);
                const file2Data = await readFileData(values.file2);

                console.log("File 1 Data:", file1Data);
                console.log("File 2 Data:", file2Data);
                setfile1Data(file1Data)
                setfile2Data(file2Data)

                actions.resetForm();
            } catch (error) {
                console.error("Error reading files:", error);
            }
        },
    });

    const handleFileChange = (event) => {
        const { name, files } = event.target;
        formik.setFieldValue(name, files[0]);
    };
    const readFileData = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                resolve(jsonData);
            };
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        });
    };

    return (
        <Box padding={'10px'}>
            <Box display={'flex'} flexDirection={'row'} justifyContent={'center'} alignItems={'center'}>
                <form onSubmit={formik.handleSubmit}>
                    <FormControl isInvalid={formik.errors.file1} p='2px' my='5px'>
                        <FormLabel>File 1</FormLabel>
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
                        <FormLabel>File 2</FormLabel>
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

            {file1Data.length > 0 && (
                <Box my={4}>
                    <Table variant='striped' colorScheme='gray'>
                        <Thead>
                            <Tr>
                                <Th>Column 1</Th>
                                {/* Add additional headers as needed */}
                            </Tr>
                        </Thead>
                        <Tbody>
                            {file1Data.map((row, index) => (
                                <Tr key={index}>
                                    <Td>{row[6]}</Td>
                                    <Td>{row[6]}</Td>
                                    {/* Render additional cells for other columns */}
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            )}
        </Box>
    );
};

export default Home;
