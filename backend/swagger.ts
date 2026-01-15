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
                    description: 'Represents a school entity with flat and derived properties.',
                    properties: {
                        udise_code: { type: 'string', example: '03010100101', description: 'Unique 11-digit UDISE code' },
                        id: { type: 'string', example: '03010100101', description: 'Mapped from UDISE Code (Primary Key)' },
                        slug: { type: 'string', example: 'govt-high-school-bathinda-030101', description: 'URL-friendly identifier' },
                        name: { type: 'string', example: 'Govt High School' },

                        // Location
                        address: { type: 'string', example: 'Near Main Market' },
                        district: { type: 'string', example: 'Bathinda' },
                        block: { type: 'string', example: 'Bathinda West' },
                        state: { type: 'string', example: 'Punjab' },
                        pincode: { type: 'integer', example: 151001 },
                        latitude: { type: 'number', example: 30.2109 },
                        longitude: { type: 'number', example: 74.9455 },
                        lat: { type: 'number', example: 30.2109, description: 'Frontend Alias for latitude' },
                        lng: { type: 'number', example: 74.9455, description: 'Frontend Alias for longitude' },

                        // Core Attributes
                        board: { type: 'string', example: 'CBSE' },
                        school_type: { type: 'string', example: 'Co-educational' },
                        management: { type: 'string', example: 'Department of Education' },
                        estd_year: { type: 'integer', example: 1985 },

                        // Fees
                        tuition_fee: { type: 'number', example: 1200 },
                        admission_fee: { type: 'number', example: 5000 },

                        // Metrics
                        // Metrics
                        student_teacher_ratio: { type: 'number', example: 25.5 },
                        students_per_classroom: { type: 'number', example: 45 },
                        gender_parity_index: { type: 'number', example: 0.98 },
                        girls_toilets_per_1000: { type: 'number', example: 2.5 },
                        boys_toilets_per_1000: { type: 'number', example: 2.1 },
                        teacher_training_pct: { type: 'number', example: 85.5 },
                        instructional_days_pct: { type: 'number', example: 92.0 },

                        // Media
                        images: {
                            type: 'object',
                            properties: {
                                main: { type: 'string', nullable: true, example: 'https://example.com/img.jpg' },
                                gallery: { type: 'array', items: { type: 'string' } }
                            }
                        }
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

