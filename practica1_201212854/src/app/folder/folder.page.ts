import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  public folder!: string;
  public listPokemones: any[] = [];
  public listCountrys: any[] = [];
  private activatedRoute = inject(ActivatedRoute);
  config: any;
  config2: any;

  constructor(private httpclient: HttpClient) {
    this.config = {
      itemsPerPage: 10,
      currentPage: 1,
    };

    this.config2 = {
      itemsPerPage: 10,
      currentPage: 1,
    };
  }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;

    if (this.folder === 'inbox') {
       this.getListPokemon();
    } else {
      this.getAllCountry();
    }
  }

  //Metodo get para obtener listado de pokemones
  getListPokemon() {
    this.httpclient.get<any>("https://pokeapi.co/api/v2/pokemon").subscribe((data => {
        this.listPokemones = data.results;
        console.log(this.listPokemones);
       }));
  }

  //Metodo de API SOAP de documenter.getpostman post para obtener listado de ciudades 
  /* 
    Se creo una API especial para consumir la API SOAP por problemas de CORS 
  */
  getAllCountry() {
    const clientId = 'sa';
    const clientSecret = 'fb5089840031449f1a4bf2c91c2bd2261d5b2f122bd8754ffe23be17b107b8eb103b441de3771745';

    this.config.currentPage = 1;
    this.httpclient.post<any>("http://localhost:3000/api/token", { "client_id": clientId, "client_secret": clientSecret}).subscribe(data => {
      console.log(data);
      this.httpclient.get<any>("http://localhost:3000/api/country").subscribe((data => {      
        for (let index = 0; index < data.countries.length; index++) {
          const name = data.countries[index]["m:sName"];
          const capital = data.countries[index]["m:sCapitalCity"];
          this.listCountrys.push({name, capital});
        }
      }));
    });

    
  }

  pageChanged(event: any) {
    this.config.currentPage = 1;
    this.config.currentPage = event;
  }

  pageChanged2(event: any) {
    this.config2.currentPage = 1;
    this.config2.currentPage = event;
  }
}
