const express = require('express');
const axios = require('axios');
const { parseStringPromise } = require('xml2js');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors()); // Aplicar la configuración de CORS

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
