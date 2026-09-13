/**
 * Script para probar directamente la API de Gemini
 * Uso: node test-gemini-api.js TU_API_KEY
 */

const API_KEY = process.argv[2] || process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error('❌ Error: Debes proporcionar una API key');
    console.log('Uso: node test-gemini-api.js YOUR_API_KEY');
    process.exit(1);
}

async function testGeminiAPI() {
    console.log('🧪 Probando Gemini API...\n');

    const models = [
        'gemini-1.5-flash',
        'gemini-2.0-flash-exp',
        'gemini-1.5-pro'
    ];

    for (const model of models) {
        console.log(`\n📦 Probando modelo: ${model}`);
        console.log('─'.repeat(50));

        try {
            const startTime = Date.now();

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: 'Hola, ¿funciona correctamente?'
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 100,
                        }
                    })
                }
            );

            const duration = Date.now() - startTime;

            console.log(`Status: ${response.status} ${response.statusText}`);
            console.log(`Duración: ${duration}ms`);

            if (!response.ok) {
                const errorText = await response.text();
                console.log(`❌ Error: ${errorText}`);

                // Parse error details
                try {
                    const errorJson = JSON.parse(errorText);
                    console.log('\n📋 Detalles del error:');
                    console.log(JSON.stringify(errorJson, null, 2));

                    // Check for specific errors
                    if (response.status === 429) {
                        console.log('\n⚠️  RATE LIMIT EXCEDIDO');
                        console.log('Soluciones:');
                        console.log('1. Espera unos minutos antes de reintentar');
                        console.log('2. Verifica tu cuota en: https://aistudio.google.com/apikey');
                        console.log('3. Si tienes Gemini Pro, verifica que la API key sea correcta');
                    } else if (response.status === 403) {
                        console.log('\n⚠️  ACCESO DENEGADO');
                        console.log('Posibles causas:');
                        console.log('1. API key incorrecta o expirada');
                        console.log('2. API no habilitada en tu proyecto');
                        console.log('3. Restricciones de IP o referrer');
                    } else if (response.status === 404) {
                        console.log('\n⚠️  MODELO NO ENCONTRADO');
                        console.log(`El modelo "${model}" no está disponible para tu cuenta`);
                    }
                } catch (e) {
                    console.log('Error sin formato JSON');
                }
            } else {
                const data = await response.json();
                console.log('✅ Respuesta exitosa');

                if (data.candidates && data.candidates[0]) {
                    const text = data.candidates[0].content.parts[0].text;
                    console.log(`📝 Texto generado: "${text.substring(0, 100)}..."`);
                }

                // Check usage metadata
                if (data.usageMetadata) {
                    console.log('\n📊 Uso de tokens:');
                    console.log(`  - Prompt: ${data.usageMetadata.promptTokenCount}`);
                    console.log(`  - Response: ${data.usageMetadata.candidatesTokenCount}`);
                    console.log(`  - Total: ${data.usageMetadata.totalTokenCount}`);
                }
            }
        } catch (error) {
            console.log(`❌ Error de red: ${error.message}`);
        }
    }

    // Test rate limits
    console.log('\n\n🔄 Probando límites de rate (3 requests rápidas)...');
    console.log('─'.repeat(50));

    for (let i = 1; i <= 3; i++) {
        console.log(`\n📤 Request ${i}/3`);
        const startTime = Date.now();

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: `Test ${i}` }] }],
                        generationConfig: { maxOutputTokens: 10 }
                    })
                }
            );

            const duration = Date.now() - startTime;
            console.log(`Status: ${response.status} (${duration}ms)`);

            if (response.status === 429) {
                console.log('⚠️  Rate limit alcanzado en request #' + i);
                break;
            }
        } catch (error) {
            console.log(`Error: ${error.message}`);
        }
    }

    console.log('\n\n✅ Prueba completada');
    console.log('\n💡 Recomendaciones:');
    console.log('- Si tienes Gemini Pro, usa "gemini-1.5-pro" para mejores límites');
    console.log('- Verifica tu cuota en: https://aistudio.google.com/apikey');
    console.log('- Revisa el estado de la API: https://status.cloud.google.com/');
}

testGeminiAPI().catch(console.error);