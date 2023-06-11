const express = require('express');
const axios = require('axios');
const { parseStringPromise } = require('xml2js');
const cors = require('cors');

const app = express();
app.use(express.json())
const PORT = 3000;

app.use(cors()); // Aplicar la configuración de CORS

const clientId = 'sa';
const clientSecret = 'fb5089840031449f1a4bf2c91c2bd2261d5b2f122bd8754ffe23be17b107b8eb103b441de3771745';

// Almacenar el token de acceso
let accessToken = '';

// Endpoint para generar el token de acceso
app.post('/api/token', async (req, res) => {
  try {
    // Verificar las credenciales del cliente
    const { client_id, client_secret } = req.body;
    if (client_id !== clientId || client_secret !== clientSecret) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar un nuevo token de acceso (puede implementar su lógica personalizada aquí)
    accessToken = '201212854SA';

    // Retornar el token de acceso
    res.json({ access_token: accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar el token de acceso' });
  }
});

// Middleware para verificar el token de acceso en las rutas protegidas
const verifyToken = (req, res, next) => {
  const { authorization } = req.headers;

  // Verificar si se proporcionó el token de acceso en el encabezado Authorization
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso no autorizado' });
  }

  const token = authorization.split(' ')[1];

  // Verificar si el token de acceso es válido
  if (token !== accessToken) {
    return res.status(401).json({ error: 'Acceso no autorizado' });
  }

  next();
};


app.get('/api/country/', async (req, res) => {
    try {
        // Construye la solicitud SOAP
        const soapEnvelope = `
          <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://www.oorsprong.org/websamples.countryinfo">
            <soap:Body>
              <web:FullCountryInfoAllCountries/>
            </soap:Body>
          </soap:Envelope>
        `;
    
        // Realiza la solicitud SOAP a la API SOAP
        const soapResponse = await axios.post('http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso', soapEnvelope, {
          headers: {
            'Content-Type': 'text/xml'
          }
        });
    
        // Convierte la respuesta SOAP XML en un objeto JSON
        const parsedResponse = await parseStringPromise(soapResponse.data, { explicitArray: false });
    
        // Extrae el listado de países de la respuesta SOAP
        const countries = parsedResponse['soap:Envelope']['soap:Body']['m:FullCountryInfoAllCountriesResponse']['m:FullCountryInfoAllCountriesResult']["m:tCountryInfo"];
    

        // Retorna el listado de países
        res.json({ countries });

      } catch (error) {
        console.error(error);
        throw new Error('Error al obtener el listado de países');
      }
    
  });

  app.post('/api/countryforName/', async (req, res) => {
    try {
      const { countryCode } = req.params;
  
      // Construye la solicitud SOAP
      const soapEnvelope = `
        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://www.oorsprong.org/websamples.countryinfo">
          <soap:Body>
            <web:CountryName>
              <web:sCountryISOCode>${countryCode}</web:sCountryISOCode>
            </web:CountryName>
          </soap:Body>
        </soap:Envelope>
      `;
  
      // Realiza la solicitud SOAP a la API SOAP
      const soapResponse = await axios.post('http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso', soapEnvelope, {
        headers: {
          'Content-Type': 'text/xml'
        }
      });
  
      // Convierte la respuesta SOAP XML en un objeto JSON
      const parsedResponse = await parseStringPromise(soapResponse.data, { explicitArray: false });
  
      // Extrae el nombre del país de la respuesta SOAP
      const countryName = parsedResponse['soap:Envelope']['soap:Body']['m:CountryNameResponse']['m:CountryNameResult'];
  
      res.json({ countryName });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
  });

app.listen(PORT, () => {
  console.log(`API REST corriendo en http://localhost:${PORT}`);
});
