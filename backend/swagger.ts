import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'GetSchoolInfo API',
            version: '1.0.0',
            description: 'Comprehensive API for accessing government-verified school data. \n\nFeatures include:\n- **School Search**: Filter by location and name.\n- **Detailed Profiles**: Access infrastructure, fees, and academic stats.\n- **Metadata**: Dynamic location configuration.',
            contact: {
                name: 'API Support',
                email: 'support@getschoolinfo.com',
                url: 'https://getschoolinfo.com/contact'
            },
            license: {
                name: 'Private',
                url: 'https://getschoolinfo.com/terms'
            }
        },
        servers: [
            {
                url: 'http://localhost:4000',
                description: 'Development Server',
            },
            {
                url: 'https://api.getschoolinfo.com',
                description: 'Production Server',
            },
        ],
        tags: [
            {
                name: 'Schools',
                description: 'Operations related to school data retrieval',
            },
            {
                name: 'Configuration',
                description: 'Metadata and configuration endpoints',
            },
            {
                name: 'System',
                description: 'System health and status checks',
            },
        ],
        components: {
            schemas: {
                School: {
                    type: 'object',
                    description: 'Represents a school entity with exact API response keys.',
                    properties: {
                        // Identifiers
                        id: { type: 'string', example: '03010100101', description: 'Mapped from UDISE Code (Primary Key)' },
                        udiseCode: { type: 'string', example: '03010100101' },
                        slug: { type: 'string', example: 'govt-high-school-bathinda-030101' },
                        name: { type: 'string', example: 'Govt High School' },

                        // Location
                        address: { type: 'string', example: 'Near Main Market, Bathinda' },
                        district: { type: 'string', example: 'Bathinda' },
                        block: { type: 'string', example: 'Bathinda West' },
                        state: { type: 'string', example: 'Punjab' },
                        pincode: { type: 'integer', example: 151001 },
                        lat: { type: 'number', example: 30.2109 },
                        lng: { type: 'number', example: 74.9455 },

                        // Classification
                        boardSecName: { type: 'string', example: 'CBSE' },
                        schTypeDesc: { type: 'string', example: 'Co-educational' },
                        schMgmtDesc: { type: 'string', example: 'Department of Education' },
                        schoolStatusName: { type: 'string', example: 'Operational' },
                        estdYear: { type: 'string', example: '1985', nullable: true },

                        // Infrastructure & Booleans
                        clsrmsGd: { type: 'integer', example: 12 },
                        totalTeacher: { type: 'integer', example: 25 },
                        rowTotal: { type: 'integer', example: 500, description: 'Total Students' },
                        libraryYnDesc: { type: 'string', example: '1-Yes' },
                        playgroundYnDesc: { type: 'string', example: '1-Yes' },
                        internetYnDesc: { type: 'string', example: '1-Yes' },
                        toiletbFun: { type: 'integer', example: 4 },
                        toiletgFun: { type: 'integer', example: 4 },

                        // Fees
                        tuitionFeeInRupees: { type: 'number', example: 1200 },
                        admissionFeeInRupees: { type: 'number', example: 5000 },

                        // Calculated Metrics (snake_case)
                        student_teacher_ratio: { type: 'number', example: 25.5 },
                        students_per_classroom: { type: 'number', example: 40 },
                        girls_toilets_per_1000: { type: 'number', example: 2.5 },
                        teacher_training_pct: { type: 'number', example: 85.5 },

                        // Media
                        image: { type: 'string', nullable: true, example: 'https://example.com/school.jpg' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            example: 'Resource not found'
                        }
                    }
                }
            }
        }
    },
    apis: ['./index.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

