import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';

import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { XYZ, Vector as VectorSource } from 'ol/source';
import { Style, Fill, Stroke, Circle } from 'ol/style';
import { GeoJSON } from 'ol/format';
import { click, singleClick } from 'ol/events/condition';
import Select from 'ol/interaction/Select';

// rayon 2*PI*r
const radius = 50;
const perimeter = 2 * Math.PI * radius;
const lineCap = 'but';
const width = 8;

const repart: { nb: number; color: string }[] = [
 { nb: 6, color: 'red' },
 { nb: 24, color: 'green' },
 { nb: 5, color: 'orange' },
 { nb: 12, color: 'purple' },
];

function getDonutStyles(radius: number, width: number, repart: { nb: number; color: string }[]) {
  const perimeter = 2 * Math.PI * radius;
  const total = repart.reduce((acc, curr) => acc + curr.nb, 0);
  const styles = [];

  repart
    .sort((r1, r2) => r2.nb - r1.nb)
    .reduce((acc, curr) => {
      styles.push(
        new Style({
          image: new Circle({
            radius,
            stroke: new Stroke({
              color: curr.color,
              width,
              lineDash: [0, acc === 0 ? 0 : perimeter * acc / total, perimeter * curr.nb / total,  perimeter],
              lineCap: 'but'
            })
          })
        })
      );
      return acc + curr.nb;
    }, 0);

  return styles;
}

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent  {
  map: Map;
  vectorSource: VectorSource = new VectorSource();
  
  ngOnInit() {
    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new XYZ({ url: 'https://{a-c}.tile.osm.org/{z}/{x}/{y}.png' })
        }),
        new VectorLayer({
          source: this.vectorSource,
          style: [
            new Style({ image: new Circle({ radius, fill: new Fill({ color: 'white' }) }) }),
            ...getDonutStyles(radius, width, repart)
          ]
        })
      ],
      view: new View({
        center: [288626, 5885039],
        zoom: 5
      })
    });

    const geojson =  {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Point",
            "coordinates": [
              3.115096092224121,
              45.78757682111226
            ]
          }
        }
      ]
    };

    this.vectorSource.addFeatures((new GeoJSON()).readFeatures(geojson, {
      dataProjection : 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    })); 
  }
}
