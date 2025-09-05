import { FC, Ref, useRef, useState } from "react"
import { MarkerLayer, TileLayer, Tyria, type TyriaMapOptions } from "tyria";
import styles from './App.module.css';

import campRed from './assets/camp_red.webp';
import campGreen from './assets/camp_green.webp';
import campBlue from './assets/camp_blue.webp';
import towerRed from './assets/tower_red.webp';
import towerGreen from './assets/tower_green.webp';
import towerBlue from './assets/tower_blue.webp';
import castleRed from './assets/castle_red.webp';
import castleGreen from './assets/castle_green.webp';
import castleBlue from './assets/castle_blue.webp';
import keepRed from './assets/keep_red.webp';
import keepGreen from './assets/keep_green.webp';
import keepBlue from './assets/keep_blue.webp';
import ruinsRed from './assets/ruins_red.webp';
import ruinsGreen from './assets/ruins_green.webp';
import ruinsBlue from './assets/ruins_blue.webp';


const icons: Record<'Camp' | 'Tower' | 'Keep' | 'Ruins' | 'Castle', Record<'Red' | 'Green' | 'Blue', string>> = {
  'Camp': {
    'Red': campRed,
    'Green': campGreen,
    'Blue': campBlue,
  },
  'Tower': {
    'Red': towerRed,
    'Green': towerGreen,
    'Blue': towerBlue,
  },
  'Keep': {
    'Red': keepRed,
    'Green': keepGreen,
    'Blue': keepBlue,
  },
  'Ruins': {
    'Red': ruinsRed,
    'Green': ruinsGreen,
    'Blue': ruinsBlue,
  },
  'Castle': {
    'Red': castleRed,
    'Green': castleGreen,
    'Blue': castleBlue,
  }
}

const mapOptions: TyriaMapOptions = {
  backgroundColor: '#fff',
  maxZoom: 6,
  minZoom: 3,
  nativeZoom: 6,
  zoomSnap: .5,
  padding: 0,
  bounds: [[5400, 8900], [15500, 16000]],
};

export default function App() {
  const map = useRef<Tyria>(null);
  const [objective, setObjective] = useState<string>();

  return (
    <div className={styles.layout}>
      <TyriaMap options={mapOptions} ref={map} onObjectiveClick={setObjective}/>
      <div className={styles.sidebar}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button onClick={() => map.current?.easeTo({ contain: [[ 8958, 12798], [12030, 15870]] })}>EBG</button>
          <button onClick={() => map.current?.easeTo({ contain: [[ 5630, 11518], [ 8190, 15102]] })}>Green BL</button>
          <button onClick={() => map.current?.easeTo({ contain: [[12798, 10878], [15358, 14462]] })}>Blue BL</button>
          <button onClick={() => map.current?.easeTo({ contain: [[ 9214,  8958], [12286, 12030]] })}>Red BL</button>
          <button onClick={() => map.current?.easeTo({ contain: [[ 5600,  8900], [15300, 15800]] })}>Reset</button>
        </div>
        {objective && objectives.has(objective) && (
          <div style={{ fontSize: 20, fontWeight: 'bold' }}>{objectives.get(objective)!.name}</div>
        )}
      </div>
    </div>
  )
}


const TyriaMap: FC<{ options: TyriaMapOptions, ref?: Ref<Tyria>, onObjectiveClick: (id: string) => void }> = ({ options: initialOptions, ref, onObjectiveClick }) => {
  const [options] = useState(initialOptions);
  const tyria = useRef<Tyria>(null);

  const init = (element: HTMLDivElement) => {
    if(element && !tyria.current) {
      tyria.current = new Tyria(element, options);
      tyria.current.addLayer(new TileLayer({
        source: (x, y, z) => `https://tiles.gw2.ninja/2/1/${z}/${x}/${y}.jpg`,
        bounds: [[0, 0], [16384, 16384]],
      }));

      const markers = new MarkerLayer({ icon: campGreen, iconSize: [32, 32] });
      for(const map of data.maps) {
        for(const objective of map.objectives) {
          if(objective.type === 'Camp' || objective.type === 'Tower' || objective.type === 'Keep' || objective.type === 'Ruins' || objective.type === 'Castle') {
            const objectiveDef = objectives.get(objective.id);

            markers.add({ id: objective.id, position: objectiveDef?.coord as [number, number], icon: icons[objective.type][objective.owner as 'Red'], iconSize: [32, 32] })
          }
        }
      }

      tyria.current.addEventListener('marker.click', (e) => onObjectiveClick(e.markerId))

      tyria.current.addLayer(markers);

      tyria.current.jumpTo({ contain: [[5600, 8900], [15300, 15800]] });

      if(typeof ref === 'function') {
        ref(tyria.current)
      } else if(ref) {
        ref.current = tyria.current
      }

      // @ts-expect-error debug
      window.map = tyria.current;
    }
  }

  return (
    <div ref={init} className={styles.map}>
      <div className={styles.controls}>
        <button onClick={() => tyria.current!.easeTo({ zoom: tyria.current!.view.zoom + .5 }, { duration: 300 })}>+</button>
        <button onClick={() => tyria.current!.easeTo({ zoom: tyria.current!.view.zoom - .5 }, { duration: 300 })}>-</button>
      </div>
    </div>
  );
}


const data = {
  "id": "2-1",
  "start_time": "2025-04-11T18:00:00Z",
  "end_time": "2025-04-18T17:58:00Z",
  "scores": {
    "red": 243321,
    "blue": 294903,
    "green": 617761
  },
  "worlds": {
    "red": 2014,
    "blue": 2006,
    "green": 2007
  },
  "all_worlds": {
    "red": [
      12014,
      2014
    ],
    "blue": [
      12006,
      2202,
      2006
    ],
    "green": [
      12007,
      2203,
      2007
    ]
  },
  "deaths": {
    "red": 27180,
    "blue": 24135,
    "green": 25398
  },
  "kills": {
    "red": 14948,
    "blue": 17719,
    "green": 42090
  },
  "victory_points": {
    "red": 1394,
    "blue": 1662,
    "green": 2162
  },
  "skirmishes": [
    {
      "id": 1,
      "scores": {
        "red": 3699,
        "blue": 2741,
        "green": 6777
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1877,
            "blue": 1355,
            "green": 2377
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1003,
            "blue": 617,
            "green": 1128
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 402,
            "blue": 622,
            "green": 1730
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 417,
            "blue": 147,
            "green": 1542
          }
        }
      ]
    },
    {
      "id": 2,
      "scores": {
        "red": 3158,
        "blue": 3577,
        "green": 9855
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 778,
            "blue": 1319,
            "green": 3886
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1116,
            "blue": 282,
            "green": 1781
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 653,
            "blue": 1734,
            "green": 1935
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 611,
            "blue": 242,
            "green": 2253
          }
        }
      ]
    },
    {
      "id": 3,
      "scores": {
        "red": 1884,
        "blue": 2592,
        "green": 7574
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 529,
            "blue": 769,
            "green": 3429
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 664,
            "blue": 241,
            "green": 1311
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 243,
            "blue": 1460,
            "green": 851
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 448,
            "blue": 122,
            "green": 1983
          }
        }
      ]
    },
    {
      "id": 4,
      "scores": {
        "red": 1691,
        "blue": 3146,
        "green": 5935
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 325,
            "blue": 853,
            "green": 3156
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1058,
            "blue": 487,
            "green": 793
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 123,
            "blue": 1345,
            "green": 392
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 185,
            "blue": 461,
            "green": 1594
          }
        }
      ]
    },
    {
      "id": 5,
      "scores": {
        "red": 1978,
        "blue": 3088,
        "green": 6415
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 538,
            "blue": 735,
            "green": 3217
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1264,
            "blue": 318,
            "green": 752
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 34,
            "blue": 1646,
            "green": 578
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 142,
            "blue": 389,
            "green": 1868
          }
        }
      ]
    },
    {
      "id": 6,
      "scores": {
        "red": 2288,
        "blue": 3059,
        "green": 7209
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 321,
            "blue": 628,
            "green": 3805
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1424,
            "blue": 375,
            "green": 942
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 132,
            "blue": 1905,
            "green": 490
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 411,
            "blue": 151,
            "green": 1972
          }
        }
      ]
    },
    {
      "id": 7,
      "scores": {
        "red": 2807,
        "blue": 3380,
        "green": 7381
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 315,
            "blue": 788,
            "green": 4467
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1514,
            "blue": 671,
            "green": 463
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 517,
            "blue": 1716,
            "green": 422
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 461,
            "blue": 205,
            "green": 2029
          }
        }
      ]
    },
    {
      "id": 8,
      "scores": {
        "red": 4216,
        "blue": 4490,
        "green": 6328
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1894,
            "blue": 1508,
            "green": 3916
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1665,
            "blue": 181,
            "green": 373
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 361,
            "blue": 1987,
            "green": 280
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 296,
            "blue": 814,
            "green": 1759
          }
        }
      ]
    },
    {
      "id": 9,
      "scores": {
        "red": 3980,
        "blue": 4952,
        "green": 7015
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 2705,
            "blue": 2474,
            "green": 3303
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 679,
            "blue": 377,
            "green": 1160
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 278,
            "blue": 1783,
            "green": 746
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 318,
            "blue": 318,
            "green": 1806
          }
        }
      ]
    },
    {
      "id": 10,
      "scores": {
        "red": 4073,
        "blue": 4956,
        "green": 8683
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 2072,
            "blue": 2875,
            "green": 3879
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1197,
            "blue": 82,
            "green": 931
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 320,
            "blue": 1895,
            "green": 1413
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 484,
            "blue": 104,
            "green": 2460
          }
        }
      ]
    },
    {
      "id": 11,
      "scores": {
        "red": 4545,
        "blue": 6305,
        "green": 7108
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 2207,
            "blue": 4280,
            "green": 2647
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1435,
            "blue": 74,
            "green": 978
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 360,
            "blue": 1640,
            "green": 1354
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 543,
            "blue": 311,
            "green": 2129
          }
        }
      ]
    },
    {
      "id": 12,
      "scores": {
        "red": 4817,
        "blue": 5677,
        "green": 7930
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 2320,
            "blue": 3397,
            "green": 2686
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1687,
            "blue": 505,
            "green": 1204
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 338,
            "blue": 1712,
            "green": 1745
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 472,
            "blue": 63,
            "green": 2295
          }
        }
      ]
    },
    {
      "id": 13,
      "scores": {
        "red": 4854,
        "blue": 3984,
        "green": 10970
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 2678,
            "blue": 2306,
            "green": 3694
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1146,
            "blue": 448,
            "green": 2203
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 516,
            "blue": 1050,
            "green": 2705
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 514,
            "blue": 180,
            "green": 2368
          }
        }
      ]
    },
    {
      "id": 14,
      "scores": {
        "red": 3838,
        "blue": 4103,
        "green": 8784
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1234,
            "blue": 1567,
            "green": 3400
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1325,
            "blue": 582,
            "green": 964
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 880,
            "blue": 1615,
            "green": 1949
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 399,
            "blue": 339,
            "green": 2471
          }
        }
      ]
    },
    {
      "id": 15,
      "scores": {
        "red": 3002,
        "blue": 3618,
        "green": 7023
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1436,
            "blue": 817,
            "green": 3117
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 992,
            "blue": 408,
            "green": 688
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 383,
            "blue": 1727,
            "green": 1597
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 191,
            "blue": 666,
            "green": 1621
          }
        }
      ]
    },
    {
      "id": 16,
      "scores": {
        "red": 2947,
        "blue": 5547,
        "green": 3125
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1318,
            "blue": 2040,
            "green": 1656
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 958,
            "blue": 590,
            "green": 512
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 171,
            "blue": 1751,
            "green": 720
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 500,
            "blue": 1166,
            "green": 237
          }
        }
      ]
    },
    {
      "id": 17,
      "scores": {
        "red": 2862,
        "blue": 6353,
        "green": 2465
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1656,
            "blue": 2180,
            "green": 1560
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 897,
            "blue": 764,
            "green": 658
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 85,
            "blue": 2073,
            "green": 137
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 224,
            "blue": 1336,
            "green": 110
          }
        }
      ]
    },
    {
      "id": 18,
      "scores": {
        "red": 3742,
        "blue": 5707,
        "green": 3543
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1636,
            "blue": 1741,
            "green": 2661
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1565,
            "blue": 530,
            "green": 362
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 126,
            "blue": 2067,
            "green": 379
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 415,
            "blue": 1369,
            "green": 141
          }
        }
      ]
    },
    {
      "id": 19,
      "scores": {
        "red": 5306,
        "blue": 3803,
        "green": 3906
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 2264,
            "blue": 1175,
            "green": 2657
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1611,
            "blue": 303,
            "green": 320
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 526,
            "blue": 2030,
            "green": 317
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 905,
            "blue": 295,
            "green": 612
          }
        }
      ]
    },
    {
      "id": 20,
      "scores": {
        "red": 5663,
        "blue": 6044,
        "green": 4476
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 2676,
            "blue": 2128,
            "green": 3102
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1675,
            "blue": 479,
            "green": 325
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 619,
            "blue": 2689,
            "green": 269
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 693,
            "blue": 748,
            "green": 780
          }
        }
      ]
    },
    {
      "id": 21,
      "scores": {
        "red": 3523,
        "blue": 5242,
        "green": 6025
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1807,
            "blue": 1945,
            "green": 3400
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 878,
            "blue": 535,
            "green": 708
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 328,
            "blue": 2252,
            "green": 807
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 510,
            "blue": 510,
            "green": 1110
          }
        }
      ]
    },
    {
      "id": 22,
      "scores": {
        "red": 3474,
        "blue": 4586,
        "green": 7617
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1866,
            "blue": 1827,
            "green": 3678
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 987,
            "blue": 497,
            "green": 568
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 237,
            "blue": 2010,
            "green": 1272
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 384,
            "blue": 252,
            "green": 2099
          }
        }
      ]
    },
    {
      "id": 23,
      "scores": {
        "red": 3892,
        "blue": 3974,
        "green": 9671
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1662,
            "blue": 1151,
            "green": 4817
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1303,
            "blue": 220,
            "green": 698
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 503,
            "blue": 2114,
            "green": 1783
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 424,
            "blue": 489,
            "green": 2373
          }
        }
      ]
    },
    {
      "id": 24,
      "scores": {
        "red": 2985,
        "blue": 3787,
        "green": 11140
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1781,
            "blue": 1292,
            "green": 3683
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 919,
            "blue": 354,
            "green": 2000
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 166,
            "blue": 1965,
            "green": 2743
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 119,
            "blue": 176,
            "green": 2714
          }
        }
      ]
    },
    {
      "id": 25,
      "scores": {
        "red": 8002,
        "blue": 8218,
        "green": 12353
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 3080,
            "blue": 2585,
            "green": 4543
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1847,
            "blue": 1358,
            "green": 1730
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 1561,
            "blue": 2950,
            "green": 2052
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 1514,
            "blue": 1325,
            "green": 4028
          }
        }
      ]
    },
    {
      "id": 26,
      "scores": {
        "red": 3535,
        "blue": 5117,
        "green": 10607
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 2112,
            "blue": 2596,
            "green": 4780
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 628,
            "blue": 467,
            "green": 1628
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 264,
            "blue": 1666,
            "green": 1825
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 531,
            "blue": 388,
            "green": 2374
          }
        }
      ]
    },
    {
      "id": 27,
      "scores": {
        "red": 1202,
        "blue": 1206,
        "green": 9045
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 308,
            "blue": 237,
            "green": 3971
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 303,
            "blue": 304,
            "green": 1569
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 403,
            "blue": 429,
            "green": 1379
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 188,
            "blue": 236,
            "green": 2126
          }
        }
      ]
    },
    {
      "id": 28,
      "scores": {
        "red": 2093,
        "blue": 1728,
        "green": 7500
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 962,
            "blue": 310,
            "green": 3303
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 986,
            "blue": 215,
            "green": 895
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 98,
            "blue": 917,
            "green": 1138
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 47,
            "blue": 286,
            "green": 2164
          }
        }
      ]
    },
    {
      "id": 29,
      "scores": {
        "red": 2613,
        "blue": 2038,
        "green": 7688
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1200,
            "blue": 694,
            "green": 3140
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1256,
            "blue": 121,
            "green": 1023
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 106,
            "blue": 1143,
            "green": 986
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 51,
            "blue": 80,
            "green": 2539
          }
        }
      ]
    },
    {
      "id": 30,
      "scores": {
        "red": 2781,
        "blue": 3356,
        "green": 6843
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1216,
            "blue": 1107,
            "green": 2941
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1404,
            "blue": 85,
            "green": 1239
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 90,
            "blue": 1651,
            "green": 325
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 71,
            "blue": 513,
            "green": 2338
          }
        }
      ]
    },
    {
      "id": 31,
      "scores": {
        "red": 2905,
        "blue": 4686,
        "green": 5517
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1271,
            "blue": 1709,
            "green": 2949
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1263,
            "blue": 404,
            "green": 1050
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 128,
            "blue": 1747,
            "green": 319
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 243,
            "blue": 826,
            "green": 1199
          }
        }
      ]
    },
    {
      "id": 32,
      "scores": {
        "red": 3586,
        "blue": 4106,
        "green": 5791
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1600,
            "blue": 1760,
            "green": 2721
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1325,
            "blue": 341,
            "green": 1165
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 242,
            "blue": 1579,
            "green": 610
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 419,
            "blue": 426,
            "green": 1295
          }
        }
      ]
    },
    {
      "id": 33,
      "scores": {
        "red": 2031,
        "blue": 2932,
        "green": 7371
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 597,
            "blue": 657,
            "green": 3858
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 932,
            "blue": 521,
            "green": 1284
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 282,
            "blue": 1369,
            "green": 666
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 220,
            "blue": 385,
            "green": 1563
          }
        }
      ]
    },
    {
      "id": 34,
      "scores": {
        "red": 1897,
        "blue": 2809,
        "green": 7788
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 543,
            "blue": 640,
            "green": 4043
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 583,
            "blue": 418,
            "green": 1552
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 482,
            "blue": 1367,
            "green": 659
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 289,
            "blue": 384,
            "green": 1534
          }
        }
      ]
    },
    {
      "id": 35,
      "scores": {
        "red": 2029,
        "blue": 2220,
        "green": 9796
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 364,
            "blue": 231,
            "green": 4693
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 995,
            "blue": 157,
            "green": 1561
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 382,
            "blue": 1677,
            "green": 1439
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 288,
            "blue": 155,
            "green": 2103
          }
        }
      ]
    },
    {
      "id": 36,
      "scores": {
        "red": 2770,
        "blue": 3235,
        "green": 11820
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 945,
            "blue": 885,
            "green": 5286
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1185,
            "blue": 192,
            "green": 2272
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 263,
            "blue": 1938,
            "green": 1919
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 377,
            "blue": 220,
            "green": 2343
          }
        }
      ]
    },
    {
      "id": 37,
      "scores": {
        "red": 5130,
        "blue": 6598,
        "green": 10613
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1437,
            "blue": 2575,
            "green": 4180
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 2028,
            "blue": 1308,
            "green": 2502
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 802,
            "blue": 2318,
            "green": 1675
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 863,
            "blue": 397,
            "green": 2256
          }
        }
      ]
    },
    {
      "id": 38,
      "scores": {
        "red": 2962,
        "blue": 3994,
        "green": 9332
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1395,
            "blue": 1528,
            "green": 4324
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 915,
            "blue": 459,
            "green": 1725
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 260,
            "blue": 1851,
            "green": 1313
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 392,
            "blue": 156,
            "green": 1970
          }
        }
      ]
    },
    {
      "id": 39,
      "scores": {
        "red": 871,
        "blue": 2126,
        "green": 8115
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 355,
            "blue": 716,
            "green": 3806
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 294,
            "blue": 128,
            "green": 1438
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 39,
            "blue": 910,
            "green": 1135
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 183,
            "blue": 372,
            "green": 1736
          }
        }
      ]
    },
    {
      "id": 40,
      "scores": {
        "red": 1416,
        "blue": 3594,
        "green": 5921
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 705,
            "blue": 1449,
            "green": 2582
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 579,
            "blue": 149,
            "green": 1253
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 70,
            "blue": 1456,
            "green": 411
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 62,
            "blue": 540,
            "green": 1675
          }
        }
      ]
    },
    {
      "id": 41,
      "scores": {
        "red": 3557,
        "blue": 3684,
        "green": 3682
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 2493,
            "blue": 676,
            "green": 691
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 849,
            "blue": 259,
            "green": 1096
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 117,
            "blue": 1923,
            "green": 233
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 98,
            "blue": 826,
            "green": 1662
          }
        }
      ]
    },
    {
      "id": 42,
      "scores": {
        "red": 4333,
        "blue": 3255,
        "green": 4133
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1858,
            "blue": 800,
            "green": 1628
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1390,
            "blue": 128,
            "green": 1131
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 207,
            "blue": 1786,
            "green": 307
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 878,
            "blue": 541,
            "green": 1067
          }
        }
      ]
    },
    {
      "id": 43,
      "scores": {
        "red": 3058,
        "blue": 2854,
        "green": 6023
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 565,
            "blue": 1098,
            "green": 2698
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1505,
            "blue": 100,
            "green": 1011
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 299,
            "blue": 1023,
            "green": 1094
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 689,
            "blue": 633,
            "green": 1220
          }
        }
      ]
    },
    {
      "id": 44,
      "scores": {
        "red": 4346,
        "blue": 3090,
        "green": 4036
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1124,
            "blue": 1244,
            "green": 2501
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1672,
            "blue": 471,
            "green": 122
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 921,
            "blue": 506,
            "green": 559
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 629,
            "blue": 869,
            "green": 854
          }
        }
      ]
    },
    {
      "id": 45,
      "scores": {
        "red": 2787,
        "blue": 3244,
        "green": 5335
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 687,
            "blue": 827,
            "green": 3194
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1386,
            "blue": 794,
            "green": 201
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 172,
            "blue": 844,
            "green": 1172
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 542,
            "blue": 779,
            "green": 768
          }
        }
      ]
    },
    {
      "id": 46,
      "scores": {
        "red": 2378,
        "blue": 3096,
        "green": 6810
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 255,
            "blue": 540,
            "green": 4055
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1499,
            "blue": 904,
            "green": 299
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 267,
            "blue": 1185,
            "green": 1378
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 357,
            "blue": 467,
            "green": 1078
          }
        }
      ]
    },
    {
      "id": 47,
      "scores": {
        "red": 2859,
        "blue": 2041,
        "green": 8705
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 206,
            "blue": 156,
            "green": 4850
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1881,
            "blue": 536,
            "green": 594
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 274,
            "blue": 1132,
            "green": 1653
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 498,
            "blue": 217,
            "green": 1608
          }
        }
      ]
    },
    {
      "id": 48,
      "scores": {
        "red": 1846,
        "blue": 2417,
        "green": 10312
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 414,
            "blue": 495,
            "green": 5224
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 863,
            "blue": 145,
            "green": 1255
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 218,
            "blue": 1570,
            "green": 1949
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 351,
            "blue": 207,
            "green": 1884
          }
        }
      ]
    },
    {
      "id": 49,
      "scores": {
        "red": 3412,
        "blue": 4413,
        "green": 10044
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1528,
            "blue": 1691,
            "green": 4870
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1000,
            "blue": 596,
            "green": 1026
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 283,
            "blue": 1910,
            "green": 1993
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 601,
            "blue": 216,
            "green": 2155
          }
        }
      ]
    },
    {
      "id": 50,
      "scores": {
        "red": 2961,
        "blue": 3581,
        "green": 7998
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 723,
            "blue": 806,
            "green": 4254
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1074,
            "blue": 773,
            "green": 659
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 502,
            "blue": 1650,
            "green": 750
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 662,
            "blue": 352,
            "green": 2335
          }
        }
      ]
    },
    {
      "id": 51,
      "scores": {
        "red": 1656,
        "blue": 3198,
        "green": 6322
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1017,
            "blue": 941,
            "green": 3367
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 125,
            "blue": 840,
            "green": 713
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 381,
            "blue": 1198,
            "green": 393
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 133,
            "blue": 219,
            "green": 1849
          }
        }
      ]
    },
    {
      "id": 52,
      "scores": {
        "red": 943,
        "blue": 2216,
        "green": 7311
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 503,
            "blue": 238,
            "green": 3490
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 349,
            "blue": 819,
            "green": 557
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 12,
            "blue": 803,
            "green": 1457
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 79,
            "blue": 356,
            "green": 1807
          }
        }
      ]
    },
    {
      "id": 53,
      "scores": {
        "red": 1497,
        "blue": 3581,
        "green": 5803
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 959,
            "blue": 776,
            "green": 2881
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 425,
            "blue": 853,
            "green": 665
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 63,
            "blue": 1583,
            "green": 196
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 50,
            "blue": 369,
            "green": 2061
          }
        }
      ]
    },
    {
      "id": 54,
      "scores": {
        "red": 2236,
        "blue": 2780,
        "green": 7227
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1265,
            "blue": 1346,
            "green": 2801
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 721,
            "blue": 244,
            "green": 1333
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 125,
            "blue": 882,
            "green": 915
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 125,
            "blue": 308,
            "green": 2178
          }
        }
      ]
    },
    {
      "id": 55,
      "scores": {
        "red": 2473,
        "blue": 2793,
        "green": 7754
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1105,
            "blue": 1147,
            "green": 3475
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1130,
            "blue": 294,
            "green": 1061
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 98,
            "blue": 1175,
            "green": 853
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 140,
            "blue": 177,
            "green": 2365
          }
        }
      ]
    },
    {
      "id": 56,
      "scores": {
        "red": 3085,
        "blue": 3495,
        "green": 6612
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1221,
            "blue": 1293,
            "green": 3121
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1368,
            "blue": 345,
            "green": 1153
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 192,
            "blue": 1344,
            "green": 535
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 304,
            "blue": 513,
            "green": 1803
          }
        }
      ]
    },
    {
      "id": 57,
      "scores": {
        "red": 3065,
        "blue": 2777,
        "green": 7392
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1014,
            "blue": 488,
            "green": 3627
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1287,
            "blue": 333,
            "green": 1436
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 432,
            "blue": 1219,
            "green": 701
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 332,
            "blue": 737,
            "green": 1628
          }
        }
      ]
    },
    {
      "id": 58,
      "scores": {
        "red": 2275,
        "blue": 2891,
        "green": 8008
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 687,
            "blue": 622,
            "green": 4195
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1262,
            "blue": 427,
            "green": 1358
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 112,
            "blue": 1542,
            "green": 473
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 214,
            "blue": 300,
            "green": 1982
          }
        }
      ]
    },
    {
      "id": 59,
      "scores": {
        "red": 1691,
        "blue": 2548,
        "green": 9630
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 422,
            "blue": 321,
            "green": 4866
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 529,
            "blue": 402,
            "green": 1909
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 367,
            "blue": 1604,
            "green": 761
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 373,
            "blue": 221,
            "green": 2094
          }
        }
      ]
    },
    {
      "id": 60,
      "scores": {
        "red": 2310,
        "blue": 2917,
        "green": 11377
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1024,
            "blue": 637,
            "green": 4609
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 763,
            "blue": 264,
            "green": 2106
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 246,
            "blue": 1890,
            "green": 2257
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 277,
            "blue": 126,
            "green": 2405
          }
        }
      ]
    },
    {
      "id": 61,
      "scores": {
        "red": 4188,
        "blue": 3707,
        "green": 9871
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 2395,
            "blue": 1640,
            "green": 3990
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1092,
            "blue": 383,
            "green": 1723
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 336,
            "blue": 1419,
            "green": 1792
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 365,
            "blue": 265,
            "green": 2366
          }
        }
      ]
    },
    {
      "id": 62,
      "scores": {
        "red": 2086,
        "blue": 3188,
        "green": 9827
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 724,
            "blue": 773,
            "green": 4760
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 953,
            "blue": 384,
            "green": 1735
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 156,
            "blue": 1704,
            "green": 1001
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 253,
            "blue": 327,
            "green": 2331
          }
        }
      ]
    },
    {
      "id": 63,
      "scores": {
        "red": 1096,
        "blue": 2271,
        "green": 8431
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 322,
            "blue": 461,
            "green": 4044
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 426,
            "blue": 149,
            "green": 1631
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 112,
            "blue": 1349,
            "green": 844
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 236,
            "blue": 312,
            "green": 1912
          }
        }
      ]
    },
    {
      "id": 64,
      "scores": {
        "red": 1893,
        "blue": 2619,
        "green": 6611
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 954,
            "blue": 925,
            "green": 2635
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 664,
            "blue": 234,
            "green": 1370
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 143,
            "blue": 1403,
            "green": 329
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 132,
            "blue": 57,
            "green": 2277
          }
        }
      ]
    },
    {
      "id": 65,
      "scores": {
        "red": 3971,
        "blue": 2943,
        "green": 5017
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1654,
            "blue": 1075,
            "green": 2179
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1159,
            "blue": 448,
            "green": 967
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 616,
            "blue": 1232,
            "green": 92
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 542,
            "blue": 188,
            "green": 1779
          }
        }
      ]
    },
    {
      "id": 66,
      "scores": {
        "red": 3362,
        "blue": 3153,
        "green": 5770
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 970,
            "blue": 1135,
            "green": 2671
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1228,
            "blue": 583,
            "green": 1053
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 605,
            "blue": 1267,
            "green": 159
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 559,
            "blue": 168,
            "green": 1887
          }
        }
      ]
    },
    {
      "id": 67,
      "scores": {
        "red": 3966,
        "blue": 3535,
        "green": 4971
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1154,
            "blue": 1651,
            "green": 2483
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1747,
            "blue": 434,
            "green": 255
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 450,
            "blue": 1371,
            "green": 293
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 615,
            "blue": 79,
            "green": 1940
          }
        }
      ]
    },
    {
      "id": 68,
      "scores": {
        "red": 3861,
        "blue": 2816,
        "green": 5639
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1170,
            "blue": 1003,
            "green": 2731
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1681,
            "blue": 337,
            "green": 292
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 637,
            "blue": 1294,
            "green": 352
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 373,
            "blue": 182,
            "green": 2264
          }
        }
      ]
    },
    {
      "id": 69,
      "scores": {
        "red": 3562,
        "blue": 1608,
        "green": 6402
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1015,
            "blue": 539,
            "green": 3290
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1248,
            "blue": 293,
            "green": 606
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 830,
            "blue": 511,
            "green": 500
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 469,
            "blue": 265,
            "green": 2006
          }
        }
      ]
    },
    {
      "id": 70,
      "scores": {
        "red": 2125,
        "blue": 2379,
        "green": 7929
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 540,
            "blue": 489,
            "green": 4139
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1251,
            "blue": 266,
            "green": 1017
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 181,
            "blue": 1372,
            "green": 682
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 153,
            "blue": 252,
            "green": 2091
          }
        }
      ]
    },
    {
      "id": 71,
      "scores": {
        "red": 2332,
        "blue": 3035,
        "green": 8143
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 324,
            "blue": 439,
            "green": 4108
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1328,
            "blue": 584,
            "green": 917
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 380,
            "blue": 1689,
            "green": 867
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 300,
            "blue": 323,
            "green": 2251
          }
        }
      ]
    },
    {
      "id": 72,
      "scores": {
        "red": 1274,
        "blue": 2735,
        "green": 11315
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 165,
            "blue": 247,
            "green": 4642
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 592,
            "blue": 265,
            "green": 2106
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 208,
            "blue": 1982,
            "green": 2078
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 309,
            "blue": 241,
            "green": 2489
          }
        }
      ]
    },
    {
      "id": 73,
      "scores": {
        "red": 3096,
        "blue": 4343,
        "green": 11685
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1134,
            "blue": 1633,
            "green": 4403
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1033,
            "blue": 1212,
            "green": 2271
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 447,
            "blue": 1179,
            "green": 2489
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 482,
            "blue": 319,
            "green": 2522
          }
        }
      ]
    },
    {
      "id": 74,
      "scores": {
        "red": 3696,
        "blue": 2896,
        "green": 8928
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1098,
            "blue": 765,
            "green": 4299
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1669,
            "blue": 388,
            "green": 639
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 607,
            "blue": 1333,
            "green": 1645
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 322,
            "blue": 410,
            "green": 2345
          }
        }
      ]
    },
    {
      "id": 75,
      "scores": {
        "red": 1296,
        "blue": 3051,
        "green": 8009
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 534,
            "blue": 631,
            "green": 4098
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 476,
            "blue": 389,
            "green": 1062
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 136,
            "blue": 1555,
            "green": 493
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 150,
            "blue": 476,
            "green": 2356
          }
        }
      ]
    },
    {
      "id": 76,
      "scores": {
        "red": 1538,
        "blue": 3883,
        "green": 6009
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 626,
            "blue": 671,
            "green": 3144
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 835,
            "blue": 806,
            "green": 228
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 40,
            "blue": 1950,
            "green": 313
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 37,
            "blue": 456,
            "green": 2324
          }
        }
      ]
    },
    {
      "id": 77,
      "scores": {
        "red": 2343,
        "blue": 4592,
        "green": 4528
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1188,
            "blue": 1231,
            "green": 1621
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 653,
            "blue": 871,
            "green": 346
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 184,
            "blue": 2101,
            "green": 228
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 318,
            "blue": 389,
            "green": 2333
          }
        }
      ]
    },
    {
      "id": 78,
      "scores": {
        "red": 2634,
        "blue": 3279,
        "green": 6309
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 588,
            "blue": 766,
            "green": 2938
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1195,
            "blue": 675,
            "green": 730
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 334,
            "blue": 1752,
            "green": 406
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 517,
            "blue": 86,
            "green": 2235
          }
        }
      ]
    },
    {
      "id": 79,
      "scores": {
        "red": 2784,
        "blue": 2896,
        "green": 7166
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 571,
            "blue": 439,
            "green": 3538
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 1237,
            "blue": 663,
            "green": 1214
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 272,
            "blue": 1648,
            "green": 592
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 704,
            "blue": 146,
            "green": 1822
          }
        }
      ]
    },
    {
      "id": 80,
      "scores": {
        "red": 2067,
        "blue": 3587,
        "green": 7299
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 682,
            "blue": 802,
            "green": 3232
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 437,
            "blue": 903,
            "green": 1502
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 427,
            "blue": 1767,
            "green": 479
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 521,
            "blue": 115,
            "green": 2086
          }
        }
      ]
    },
    {
      "id": 81,
      "scores": {
        "red": 1894,
        "blue": 3125,
        "green": 8863
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 1141,
            "blue": 652,
            "green": 3997
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 382,
            "blue": 665,
            "green": 1558
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 221,
            "blue": 1609,
            "green": 1059
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 150,
            "blue": 199,
            "green": 2249
          }
        }
      ]
    },
    {
      "id": 82,
      "scores": {
        "red": 3294,
        "blue": 4183,
        "green": 8693
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 2631,
            "blue": 1778,
            "green": 4058
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 393,
            "blue": 650,
            "green": 1586
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 113,
            "blue": 1480,
            "green": 717
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 157,
            "blue": 275,
            "green": 2332
          }
        }
      ]
    },
    {
      "id": 83,
      "scores": {
        "red": 1148,
        "blue": 1534,
        "green": 2777
      },
      "map_scores": [
        {
          "type": "Center",
          "scores": {
            "red": 803,
            "blue": 615,
            "green": 1306
          }
        },
        {
          "type": "RedHome",
          "scores": {
            "red": 167,
            "blue": 278,
            "green": 466
          }
        },
        {
          "type": "BlueHome",
          "scores": {
            "red": 37,
            "blue": 555,
            "green": 260
          }
        },
        {
          "type": "GreenHome",
          "scores": {
            "red": 141,
            "blue": 86,
            "green": 745
          }
        }
      ]
    }
  ],
  "maps": [
    {
      "id": 38,
      "type": "Center",
      "scores": {
        "red": 97438,
        "blue": 97331,
        "green": 288016
      },
      "bonuses": [],
      "objectives": [
        {
          "id": "38-131",
          "type": "Spawn",
          "owner": "Green",
          "last_flipped": "2025-04-17T21:03:41Z",
          "points_tick": 0,
          "points_capture": 0
        },
        {
          "id": "38-20",
          "type": "Tower",
          "owner": "Red",
          "last_flipped": "2025-04-18T11:00:38Z",
          "claimed_by": "62AB61DE-4757-EF11-8465-068565E44296",
          "claimed_at": "2025-04-18T11:01:25Z",
          "points_tick": 6,
          "points_capture": 12,
          "yaks_delivered": 26,
          "guild_upgrades": []
        },
        {
          "id": "38-10",
          "type": "Camp",
          "owner": "Green",
          "last_flipped": "2025-04-18T12:56:44Z",
          "claimed_by": null,
          "claimed_at": null,
          "points_tick": 5,
          "points_capture": 5,
          "yaks_delivered": 60,
          "guild_upgrades": []
        },
        {
          "id": "38-9",
          "type": "Castle",
          "owner": "Green",
          "last_flipped": "2025-04-18T14:15:56Z",
          "claimed_by": "3B2F73B6-BA78-4553-AEB0-623E75CDAA32",
          "claimed_at": "2025-04-18T14:16:30Z",
          "points_tick": 12,
          "points_capture": 12,
          "yaks_delivered": 6,
          "guild_upgrades": []
        },
        {
          "id": "38-4",
          "type": "Camp",
          "owner": "Blue",
          "last_flipped": "2025-04-18T14:40:22Z",
          "claimed_by": null,
          "claimed_at": null,
          "points_tick": 2,
          "points_capture": 2,
          "yaks_delivered": 0,
          "guild_upgrades": []
        },
        {
          "id": "38-6",
          "type": "Camp",
          "owner": "Green",
          "last_flipped": "2025-04-18T14:36:58Z",
          "claimed_by": null,
          "claimed_at": null,
          "points_tick": 2,
          "points_capture": 2,
          "yaks_delivered": 0,
          "guild_upgrades": []
        },
        {
          "id": "38-124",
          "type": "Spawn",
          "owner": "Red",
          "last_flipped": "2025-04-17T21:03:41Z",
          "points_tick": 0,
          "points_capture": 0
        },
        {
          "id": "38-11",
          "type": "Tower",
          "owner": "Green",
          "last_flipped": "2025-04-15T03:43:31Z",
          "claimed_by": "DE9BE6E8-2319-EC11-81A8-F161567B2263",
          "claimed_at": "2025-04-15T04:20:32Z",
          "points_tick": 10,
          "points_capture": 40,
          "yaks_delivered": 70,
          "guild_upgrades": [
            583,
            147,
            483,
            513,
            590,
            306
          ]
        },
        {
          "id": "38-12",
          "type": "Tower",
          "owner": "Green",
          "last_flipped": "2025-04-16T08:16:23Z",
          "claimed_by": "503A3A57-FFF4-EE11-BA1F-06F2763BE7D0",
          "claimed_at": "2025-04-16T09:48:26Z",
          "points_tick": 10,
          "points_capture": 40,
          "yaks_delivered": 70,
          "guild_upgrades": [
            583,
            329,
            483,
            513,
            345,
            306
          ]
        },
        {
          "id": "38-5",
          "type": "Camp",
          "owner": "Red",
          "last_flipped": "2025-04-18T14:27:59Z",
          "claimed_by": "BB37B4DB-59B4-EE11-8465-02315AB41281",
          "claimed_at": "2025-04-18T14:28:18Z",
          "points_tick": 2,
          "points_capture": 2,
          "yaks_delivered": 8,
          "guild_upgrades": []
        },
        {
          "id": "38-16",
          "type": "Tower",
          "owner": "Blue",
          "last_flipped": "2025-04-18T12:46:21Z",
          "claimed_by": "AE2CCD64-1E66-4F9C-9671-8C5DAA1A6FEC",
          "claimed_at": "2025-04-18T12:51:38Z",
          "points_tick": 10,
          "points_capture": 40,
          "yaks_delivered": 70,
          "guild_upgrades": [
            583,
            147,
            483,
            178,
            399,
            306
          ]
        },
        {
          "id": "38-8",
          "type": "Camp",
          "owner": "Blue",
          "last_flipped": "2025-04-18T14:16:33Z",
          "claimed_by": "FBC6231D-71BE-E711-81A1-02327CBC3244",
          "claimed_at": "2025-04-18T14:19:51Z",
          "points_tick": 3,
          "points_capture": 3,
          "yaks_delivered": 15,
          "guild_upgrades": []
        },
        {
          "id": "38-1",
          "type": "Keep",
          "owner": "Red",
          "last_flipped": "2025-04-18T10:55:10Z",
          "claimed_by": "B4AC9749-937A-41D4-AEB7-99937878C2E1",
          "claimed_at": "2025-04-18T12:52:21Z",
          "points_tick": 16,
          "points_capture": 48,
          "yaks_delivered": 57,
          "guild_upgrades": [
            418,
            147,
            483,
            178,
            590,
            306
          ]
        },
        {
          "id": "38-123",
          "type": "Mercenary",
          "owner": "Green",
          "last_flipped": "2025-04-18T13:44:00Z",
          "points_tick": 0,
          "points_capture": 0
        },
        {
          "id": "38-22",
          "type": "Tower",
          "owner": "Blue",
          "last_flipped": "2025-04-18T12:00:59Z",
          "claimed_by": "2E02AD8F-F707-E711-80DA-101F7433AF15",
          "claimed_at": "2025-04-18T12:12:34Z",
          "points_tick": 6,
          "points_capture": 12,
          "yaks_delivered": 28,
          "guild_upgrades": [
            583,
            147,
            483,
            399,
            389
          ]
        },
        {
          "id": "38-126",
          "type": "Mercenary",
          "owner": "Blue",
          "last_flipped": "2025-04-18T12:11:42Z",
          "points_tick": 0,
          "points_capture": 0
        },
        {
          "id": "38-17",
          "type": "Tower",
          "owner": "Red",
          "last_flipped": "2025-04-18T10:26:28Z",
          "claimed_by": "BF52831C-840D-405B-9CA7-898D02136868",
          "claimed_at": "2025-04-18T11:05:30Z",
          "points_tick": 8,
          "points_capture": 24,
          "yaks_delivered": 45,
          "guild_upgrades": [
            583,
            483,
            306
          ]
        },
        {
          "id": "38-14",
          "type": "Tower",
          "owner": "Green",
          "last_flipped": "2025-04-18T14:10:50Z",
          "claimed_by": "5DF0FB43-0C7E-EE11-BA1F-06F2763BE7D0",
          "claimed_at": "2025-04-18T14:34:43Z",
          "points_tick": 4,
          "points_capture": 4,
          "yaks_delivered": 4,
          "guild_upgrades": []
        },
        {
          "id": "38-125",
          "type": "Mercenary",
          "owner": "Blue",
          "last_flipped": "2025-04-18T13:04:59Z",
          "points_tick": 0,
          "points_capture": 0
        },
        {
          "id": "38-19",
          "type": "Tower",
          "owner": "Red",
          "last_flipped": "2025-04-18T12:19:14Z",
          "claimed_by": "80ACBA33-3BEF-4063-B7F4-1B4218198183",
          "claimed_at": "2025-04-18T12:34:25Z",
          "points_tick": 6,
          "points_capture": 12,
          "yaks_delivered": 34,
          "guild_upgrades": []
        },
        {
          "id": "38-3",
          "type": "Keep",
          "owner": "Green",
          "last_flipped": "2025-04-18T02:24:41Z",
          "claimed_by": "AAF76FBE-09DD-4056-9481-FA413FC8EF65",
          "claimed_at": "2025-04-18T02:24:44Z",
          "points_tick": 20,
          "points_capture": 80,
          "yaks_delivered": 100,
          "guild_upgrades": [
            418,
            147,
            483,
            178,
            590,
            389
          ]
        },
        {
          "id": "38-130",
          "type": "Spawn",
          "owner": "Blue",
          "last_flipped": "2025-04-17T21:03:41Z",
          "points_tick": 0,
          "points_capture": 0
        },
        {
          "id": "38-21",
          "type": "Tower",
          "owner": "Blue",
          "last_flipped": "2025-04-18T12:03:41Z",
          "claimed_by": "34569B75-ACBF-E411-BB46-80C16E7C6D65",
          "claimed_at": "2025-04-18T12:12:28Z",
          "points_tick": 8,
          "points_capture": 24,
          "yaks_delivered": 60,
          "guild_upgrades": [
            583,
            147,
            483,
            399,
            306
          ]
        },
        {
          "id": "38-18",
          "type": "Tower",
          "owner": "Red",
          "last_flipped": "2025-04-18T13:20:29Z",
          "claimed_by": "55B321C6-68FA-4092-8B6F-0FE4CCA8A1CA",
          "claimed_at": "2025-04-18T13:20:40Z",
          "points_tick": 4,
          "points_capture": 4,
          "yaks_delivered": 13,
          "guild_upgrades": []
        },
        {
          "id": "38-2",
          "type": "Keep",
          "owner": "Blue",
          "last_flipped": "2025-04-18T12:43:53Z",
          "claimed_by": "64A67322-C575-4628-9F20-C9F2B90A0D02",
          "claimed_at": "2025-04-18T12:43:57Z",
          "points_tick": 12,
          "points_capture": 24,
          "yaks_delivered": 48,
          "guild_upgrades": [
            418,
            147,
            483,
            178,
            590,
            389
          ]
        },
        {
          "id": "38-7",
          "type": "Camp",
          "owner": "Blue",
          "last_flipped": "2025-04-18T13:18:53Z",
          "claimed_by": "C0AC7F83-5663-E411-925A-AC162DAE5AD5",
          "claimed_at": "2025-04-18T13:18:56Z",
          "points_tick": 5,
          "points_capture": 5,
          "yaks_delivered": 60,
          "guild_upgrades": [
            562
          ]
        },
        {
          "id": "38-13",
          "type": "Tower",
          "owner": "Green",
          "last_flipped": "2025-04-18T13:53:17Z",
          "claimed_by": "DCD8745B-0BD8-EF11-81AB-8B4A188BDE13",
          "claimed_at": "2025-04-18T13:53:30Z",
          "points_tick": 4,
          "points_capture": 4,
          "yaks_delivered": 5,
          "guild_upgrades": []
        },
        {
          "id": "38-15",
          "type": "Tower",
          "owner": "Blue",
          "last_flipped": "2025-04-18T12:41:09Z",
          "claimed_by": "6AE566AF-99EA-48F8-B392-B0CD7B0A16B0",
          "claimed_at": "2025-04-18T12:44:07Z",
          "points_tick": 6,
          "points_capture": 12,
          "yaks_delivered": 32,
          "guild_upgrades": [
            583,
            329,
            559,
            513,
            590,
            306
          ]
        }
      ],
      "deaths": {
        "red": 15039,
        "blue": 11839,
        "green": 12941
      },
      "kills": {
        "red": 7803,
        "blue": 7699,
        "green": 23823
      }
    },
    {
      "id": 1099,
      "type": "RedHome",
      "scores": {
        "red": 88409,
        "blue": 37934,
        "green": 90667
      },
      "bonuses": [
        {
          "type": "Bloodlust",
          "owner": "Blue"
        }
      ],
      "objectives": [
        {
          "id": "1099-116",
          "type": "Camp",
          "owner": "Blue",
          "last_flipped": "2025-04-18T14:29:22Z",
          "claimed_by": null,
          "claimed_at": null,
          "points_tick": 2,
          "points_capture": 2,
          "yaks_delivered": 0,
          "guild_upgrades": []
        },
        {
          "id": "1099-118",
          "type": "Ruins",
          "owner": "Blue",
          "last_flipped": "2025-04-18T14:21:23Z",
          "points_tick": 0,
          "points_capture": 0
        },
        {
          "id": "1099-114",
          "type": "Keep",
          "owner": "Blue",
          "last_flipped": "2025-04-18T08:38:20Z",
          "claimed_by": "8569E2B7-F182-E311-88E3-AC162DC0E835",
          "claimed_at": "2025-04-18T08:38:41Z",
          "points_tick": 16,
          "points_capture": 48,
          "yaks_delivered": 61,
          "guild_upgrades": []
        },
        {
          "id": "1099-107",
          "type": "Spawn",
          "owner": "Blue",
          "last_flipped": "2025-04-17T21:03:51Z",
          "points_tick": 0,
          "points_capture": 0
        },
        {
          "id": "1099-99",
          "type": "Camp",
          "owner": "Green",
          "last_flipped": "2025-04-18T14:37:30Z",
          "claimed_by": null,
          "claimed_at": null,
          "points_tick": 2,
          "points_capture": 2,
          "yaks_delivered": 0,
          "guild_upgrades": []
        },
        {
          "id": "1099-113",
          "type": "Keep",
          "owner": "Green",
          "last_flipped": "2025-04-18T09:19:55Z",
          "claimed_by": "BD05AC45-6370-4B31-8C60-86FE9B8088B7",
          "claimed_at": "2025-04-18T09:20:08Z",
          "points_tick": 12,
          "points_capture": 24,
          "yaks_delivered": 48,
          "guild_upgrades": [
            418,
            147,
            559,
            178,
            590,
            306
          ]
        },
        {
          "id": "1099-119",
          "type": "Ruins",
          "owner": "Green",
          "last_flipped": "2025-04-18T14:39:49Z",
          "points_tick": 0,
          "points_capture": 0
        },
        {
          "id": "1099-115",
          "type": "Camp",
          "owner": "Green",
          "last_flipped": "2025-04-18T14:33:12Z",
          "claimed_by": null,
          "claimed_at": null,
          "points_tick": 2,
          "points_capture": 2,
          "yaks_delivered": 1,
          "guild_upgrades": []
        },
        {
          "id": "1099-110",
          "type": "Tower",
          "owner": "Green",
          "last_flipped": "2025-04-18T02:52:07Z",
          "claimed_by": "AAF76FBE-09DD-4056-9481-FA413FC8EF65",
          "claimed_at": "2025-04-18T07:17:15Z",
          "points_tick": 10,
          "points_capture": 40,
          "yaks_delivered": 70,
          "guild_upgrades": [
            583,
            559,
            178,
            389
          ]
        },
        {
          "id": "1099-106",
          "type": "Keep",
          "owner": "Green",
          "last_flipped": "2025-04-18T03:15:50Z",
          "claimed_by": "0EFB47AB-2ADB-EB11-81AB-8CD3CF4E85AB",
          "claimed_at": "2025-04-18T05:45:18Z",
          "points_tick": 20,
          "points_capture": 80,
          "yaks_delivered": 100,
          "guild_upgrades": [
            418,
            147,
            483,
            178,
            345,
            389
          ]
        },
        {
          "id": "1099-122",
          "type": "Ruins",
          "owner": "Blue",
          "last_flipped": "2025-04-18T14:28:37Z",
          "points_tick": 0,
          "points_capture": 0
        },
        {
          "id": "1099-105",
          "type": "Tower",
          "owner": "Blue",
          "last_flipped": "2025-04-18T09:34:11Z",
          "claimed_by": "6B0EC95A-0B82-46F7-BF19-C0BD3444DC26",
          "claimed_at": "2025-04-18T09:34:27Z",
          "points_tick": 8,
          "points_capture": 24,
          "yaks_delivered": 54,
          "guild_upgrades": []
        },
        {
          "id": "1099-102",
          "type": "Tower",
          "owner": "Red",
          "last_flipped": "2025-04-18T13:28:05Z",
          "claimed_by": "95B533C0-5AE7-EB11-81A8-CDE2AC1EED30",
          "claimed_at": "2025-04-18T13:28:15Z",
          "points_tick": 4,
          "points_capture": 4,
          "yaks_delivered": 8,
          "guild_upgrades": []
        },
        {
          "id": "1099-117",
          "type": "Spawn",
          "owner": "Red",
          "last_flipped": "2025-04-17T21:03:51Z",
          "points_tick": 0,
          "points_capture": 0
        },
        {
          "id": "1099-120",
          "type": "Ruins",
          "owner": "Blue",
          "last_flipped": "2025-04-18T14:21:23Z",
          "points_tick": 0,
          "points_capture": 0
        },
        {
          "id": "1099-109",
          "type": "Camp",
          "owner": "Blue",
          "last_flipped": "2025-04-18T14:21:52Z",
          "claimed_by": null,
          "claimed_at": null,
          "points_tick": 2,
          "points_capture": 2,
          "yaks_delivered": 3,
          "guild_upgrades": []
        },
        {
          "id": "1099-101",
          "type": "Camp",
          "owner": "Green",
          "last_flipped": "2025-04-18T13:02:41Z",
          "claimed_by": "B9B679B7-3FA3-EE11-8465-068565E44296",
          "claimed_at": "2025-04-18T13:13:00Z",
          "points_tick": 4,
          "points_capture": 4,
          "yaks_delivered": 45,
          "guild_upgrades": [
            562
          ]
        },
        {
          "id": "1099-121",
          "type": "Ruins",
          "owner": "Green",
          "last_flipped": "2025-04-18T14:24:58Z",
          "points_tick": 0,
          "points_capture": 0
        },
        {
          "id": "1099-104",
          "type": "Tower",
          "owner": "Red",
          "last_flipped": "2025-04-18T09:43:39Z",
          "claimed_by": "D7C96BE6-DC15-45EB-B52F-AE0AA2A96531",
          "claimed_at": "2025-04-18T10:20:28Z",
          "points_tick": 8,
          "points_capture": 24,
          "yaks_delivered": 51,
          "guild_upgrades": []
        },
        {
          "id": "1099-108",
          "type": "Spawn",
          "owner": "Green",
          "last_flipped": "2025-04-17T21:03:51Z",
          "points_tick": 0,
          "points_capture": 0
        },
        {
          "id": "1099-100",
          "type": "Camp",
          "owner": "Blue",
          "last_flipped": "2025-04-18T14:01:49Z",
          "claimed_by": "A2AE6407-E560-E911-81A8-E944283D67C1",
          "claimed_at": "2025-04-18T14:01:53Z",
          "points_tick": 2,
          "points_capture": 2,
          "yaks_delivered": 12,
          "guild_upgrades": []
        }
      ],
      "deaths": {
        "red": 5023,
        "blue": 2554,
        "green": 3251
      },
      "kills": {
        "red": 3094,
        "blue": 2039,
        "green": 5046
      }
    },
    {
      "id": 96,
      "type": "BlueHome",
      "scores": {
        "red": 26533,
        "blue": 128047,
        "green": 81764
      },
      "bonuses": [
        {
          "type": "Bloodlust",
          "owner": "Blue"
        }
      ],
      "objectives": [
        {
          "id": "96-53",
          "type": "Camp",
          "owner": "Green",
          "last_flipped": "2025-04-18T14:24:45Z",
          "claimed_by": null,
          "claimed_at": null,
          "points_tick": 2,
          "points_capture": 2,
          "yaks_delivered": 0,
          "guild_upgrades": []
        },
        {
          "id": "96-40",
          "type": "Tower",
          "owner": "Blue",
          "last_flipped": "2025-04-18T11:26:02Z",
          "claimed_by": "F66D2DFE-883E-48FD-AFEB-A9D728AAB87F",
          "claimed_at": "2025-04-18T11:44:02Z",
          "points_tick": 6,
          "points_capture": 12,
          "yaks_delivered": 20,
          "guild_upgrades": []
        },
        {
          "id": "96-35",
          "type": "Tower",
          "owner": "Blue",
          "last_flipped": "2025-04-18T14:13:14Z",
          "claimed_by": null,
          "claimed_at": null,
          "points_tick": 4,
          "points_capture": 4,
          "yaks_delivered": 1,
          "guild_upgrades": []
        },
        {
          "id": "96-36",
          "type": "Tower",
          "owner": "Green",
          "last_flipped": "2025-04-18T12:43:03Z",
          "claimed_by": "EE90ED8E-2CDA-4174-801E-16B2C3B94CED",
          "claimed_at": "2025-04-18T14:02:00Z",
          "points_tick": 6,
          "points_capture": 6,
          "yaks_delivered": 25,
          "guild_upgrades": []
        },
        {
          "id": "96-33",
          "type": "Keep",
          "owner": "Blue",
          "last_flipped": "2025-04-18T11:41:00Z",
          "claimed_by": "3E0CB3AE-F780-E311-BC6C-AC162DC0070D",
          "claimed_at": "2025-04-18T11:41:53Z",
          "points_tick": 12,
          "points_capture": 24,
          "yaks_delivered": 26,
          "guild_upgrades": [
            418,
            559,
            399,
            389
          ]
        },
        {
          "id": "96-111",
          "type": "Spawn",
          "owner": "Blue",
          "last_flipped": "2025-04-17T21:03:33Z",
          "points_tick": 0,
          "points_capture": 0
        },
        {
          "id": "96-64",
          "type": "Ruins",
          "owner": "Blue",
          "last_flipped": "2025-04-18T14:09:42Z",
          "points_tick": 0,
          "points_capture": 0
        },
        {
          "id": "96-39",
          "type": "Camp",
          "owner": "Blue",
          "last_flipped": "2025-04-18T14:28:41Z",
          "claimed_by": "64A67322-C575-4628-9F20-C9F2B90A0D02",
          "claimed_at": "2025-04-18T14:28:44Z",
          "points_tick": 2,
          "points_capture": 2,
          "yaks_delivered": 4,
          "guild_upgrades": []
        },
        {
          "id": "96-52",
          "type": "Camp",
          "owner": "Blue",
          "last_flipped": "2025-04-18T14:27:20Z",
          "claimed_by": null,
          "claimed_at": null,
          "points_tick": 2,
          "points_capture": 2,
          "yaks_delivered": 3,
          "guild_upgrades": []
        },
        {
          "id": "96-66",
          "type": "Ruins",
          "owner": "Blue",
          "last_flipped": "2025-04-18T14:09:27Z",
          "points_tick": 0,
          "points_capture": 0
        },
        {
          "id": "96-112",
          "type": "Spawn",
          "owner": "Red",
          "last_flipped": "2025-04-17T21:03:33Z",
          "points_tick": 0,
          "points_capture": 0
        },
        {
          "id": "96-34",
          "type": "Camp",
          "owner": "Green",
          "last_flipped": "2025-04-18T14:33:02Z",
          "claimed_by": null,
          "claimed_at": null,
          "points_tick": 2,
          "points_capture": 2,
          "yaks_delivered": 1,
          "guild_upgrades": []
        },
        {
          "id": "96-32",
          "type": "Keep",
          "owner": "Blue",
          "last_flipped": "2025-04-18T14:24:13Z",
          "claimed_by": "03CE2CCE-27CC-4C89-AD61-532538ED6DE4",
          "claimed_at": "2025-04-18T14:24:48Z",
          "points_tick": 8,
          "points_capture": 8,
          "yaks_delivered": 1,
          "guild_upgrades": []
        },
        {
          "id": "96-62",
          "type": "Ruins",
          "owner": "Blue",
          "last_flipped": "2025-04-18T14:37:27Z",
          "points_tick": 0,
          "points_capture": 0
        },
        {
          "id": "96-51",
          "type": "Camp",
          "owner": "Blue",
          "last_flipped": "2025-04-18T14:30:08Z",
          "claimed_by": null,
          "claimed_at": null,
          "points_tick": 2,
          "points_capture": 2,
          "yaks_delivered": 2,
          "guild_upgrades": []
        },
        {
          "id": "96-37",
          "type": "Keep",
          "owner": "Blue",
          "last_flipped": "2025-04-17T18:34:35Z",
          "claimed_by": "A5D950BC-C82F-E411-A3E6-AC162DC0E835",
          "claimed_at": "2025-04-17T18:42:11Z",
          "points_tick": 20,
          "points_capture": 80,
          "yaks_delivered": 100,
          "guild_upgrades": [
            418,
            147,
            483,
            178,
            590,
            389
          ]
        },
        {
          "id": "96-103",
          "type": "Spawn",
          "owner": "Green",
          "last_flipped": "2025-04-17T21:03:33Z",
          "points_tick": 0,
          "points_capture": 0
        },
        {
          "id": "96-65",
          "type": "Ruins",
          "owner": "Green",
          "last_flipped": "2025-04-18T14:40:17Z",
          "points_tick": 0,
          "points_capture": 0
        },
        {
          "id": "96-38",
          "type": "Tower",
          "owner": "Blue",
          "last_flipped": "2025-04-18T11:21:57Z",
          "claimed_by": "51E25755-67E3-E311-BB46-80C16E7C6D65",
          "claimed_at": "2025-04-18T11:32:54Z",
          "points_tick": 6,
          "points_capture": 12,
          "yaks_delivered": 22,
          "guild_upgrades": []
        },
        {
          "id": "96-50",
          "type": "Camp",
          "owner": "Blue",
          "last_flipped": "2025-04-18T14:39:45Z",
          "claimed_by": null,
          "claimed_at": null,
          "points_tick": 2,
          "points_capture": 2,
          "yaks_delivered": 0,
          "guild_upgrades": []
        },
        {
          "id": "96-63",
          "type": "Ruins",
          "owner": "Blue",
          "last_flipped": "2025-04-18T14:39:34Z",
          "points_tick": 0,
          "points_capture": 0
        }
      ],
      "deaths": {
        "red": 4068,
        "blue": 7404,
        "green": 6870
      },
      "kills": {
        "red": 2293,
        "blue": 6393,
        "green": 9106
      }
    },
    {
      "id": 95,
      "type": "GreenHome",
      "scores": {
        "red": 30941,
        "blue": 31591,
        "green": 157314
      },
      "bonuses": [
        {
          "type": "Bloodlust",
          "owner": "Green"
        }
      ],
      "objectives": [
        {
          "id": "95-53",
          "type": "Camp",
          "owner": "Green",
          "last_flipped": "2025-04-18T14:38:58Z",
          "claimed_by": null,
          "claimed_at": null,
          "points_tick": 2,
          "points_capture": 2,
          "yaks_delivered": 1,
          "guild_upgrades": []
        },
        {
          "id": "95-40",
          "type": "Tower",
          "owner": "Green",
          "last_flipped": "2025-04-15T20:27:32Z",
          "claimed_by": "F699D896-C809-E811-81A1-02909F6AA9AA",
          "claimed_at": "2025-04-15T21:11:01Z",
          "points_tick": 10,
          "points_capture": 40,
          "yaks_delivered": 70,
          "guild_upgrades": [
            583,
            147,
            483,
            178,
            590,
            306
          ]
        },
        {
          "id": "95-35",
          "type": "Tower",
          "owner": "Blue",
          "last_flipped": "2025-04-18T14:34:49Z",
          "claimed_by": "620DBFBC-FD57-E611-80D3-AC162DC0847D",
          "claimed_at": "2025-04-18T14:34:55Z",
          "points_tick": 4,
          "points_capture": 4,
          "yaks_delivered": 2,
          "guild_upgrades": []
        },
        {
          "id": "95-36",
          "type": "Tower",
          "owner": "Green",
          "last_flipped": "2025-04-18T14:24:41Z",
          "claimed_by": null,
          "claimed_at": null,
          "points_tick": 4,
          "points_capture": 4,
          "yaks_delivered": 1,
          "guild_upgrades": []
        },
        {
          "id": "95-33",
          "type": "Keep",
          "owner": "Green",
          "last_flipped": "2025-04-17T09:01:42Z",
          "claimed_by": "85DB73E5-A47D-E511-A3E6-AC162DC0E835",
          "claimed_at": "2025-04-17T09:46:51Z",
          "points_tick": 20,
          "points_capture": 80,
          "yaks_delivered": 100,
          "guild_upgrades": [
            418,
            147,
            483,
            178,
            590,
            389
          ]
        },
        {
          "id": "95-111",
          "type": "Spawn",
          "owner": "Green",
          "last_flipped": "2025-04-17T21:03:35Z",
          "points_tick": 0,
          "points_capture": 0
        },
        {
          "id": "95-64",
          "type": "Ruins",
          "owner": "Green",
          "last_flipped": "2025-04-18T13:16:20Z",
          "points_tick": 0,
          "points_capture": 0
        },
        {
          "id": "95-39",
          "type": "Camp",
          "owner": "Green",
          "last_flipped": "2025-04-18T14:15:51Z",
          "claimed_by": "9E3B75A4-CC7D-EB11-81A8-F161567B2263",
          "claimed_at": "2025-04-18T14:15:54Z",
          "points_tick": 2,
          "points_capture": 2,
          "yaks_delivered": 7,
          "guild_upgrades": []
        },
        {
          "id": "95-52",
          "type": "Camp",
          "owner": "Green",
          "last_flipped": "2025-04-18T14:30:02Z",
          "claimed_by": null,
          "claimed_at": null,
          "points_tick": 2,
          "points_capture": 2,
          "yaks_delivered": 2,
          "guild_upgrades": []
        },
        {
          "id": "95-66",
          "type": "Ruins",
          "owner": "Green",
          "last_flipped": "2025-04-18T14:39:11Z",
          "points_tick": 0,
          "points_capture": 0
        },
        {
          "id": "95-112",
          "type": "Spawn",
          "owner": "Blue",
          "last_flipped": "2025-04-17T21:03:35Z",
          "points_tick": 0,
          "points_capture": 0
        },
        {
          "id": "95-34",
          "type": "Camp",
          "owner": "Red",
          "last_flipped": "2025-04-18T14:36:40Z",
          "claimed_by": "1D32A6F0-5555-4507-9B9A-C1D18538586E",
          "claimed_at": "2025-04-18T14:36:46Z",
          "points_tick": 2,
          "points_capture": 2,
          "yaks_delivered": 0,
          "guild_upgrades": []
        },
        {
          "id": "95-32",
          "type": "Keep",
          "owner": "Green",
          "last_flipped": "2025-04-18T12:46:44Z",
          "claimed_by": "3B2F73B6-BA78-4553-AEB0-623E75CDAA32",
          "claimed_at": "2025-04-18T12:46:57Z",
          "points_tick": 8,
          "points_capture": 8,
          "yaks_delivered": 17,
          "guild_upgrades": [
            418,
            399
          ]
        },
        {
          "id": "95-62",
          "type": "Ruins",
          "owner": "Red",
          "last_flipped": "2025-04-18T14:40:22Z",
          "points_tick": 0,
          "points_capture": 0
        },
        {
          "id": "95-51",
          "type": "Camp",
          "owner": "Green",
          "last_flipped": "2025-04-18T14:18:24Z",
          "claimed_by": "E91EE1E4-6677-E611-80D3-E4115BD7B405",
          "claimed_at": "2025-04-18T14:18:28Z",
          "points_tick": 2,
          "points_capture": 2,
          "yaks_delivered": 6,
          "guild_upgrades": []
        },
        {
          "id": "95-37",
          "type": "Keep",
          "owner": "Green",
          "last_flipped": "2025-04-18T06:41:29Z",
          "claimed_by": "BAA6B1FC-F1A2-E811-81A8-D0A7E04E41B6",
          "claimed_at": "2025-04-18T06:41:46Z",
          "points_tick": 20,
          "points_capture": 80,
          "yaks_delivered": 100,
          "guild_upgrades": [
            418,
            147,
            483,
            178,
            399,
            306
          ]
        },
        {
          "id": "95-103",
          "type": "Spawn",
          "owner": "Red",
          "last_flipped": "2025-04-17T21:03:35Z",
          "points_tick": 0,
          "points_capture": 0
        },
        {
          "id": "95-65",
          "type": "Ruins",
          "owner": "Green",
          "last_flipped": "2025-04-18T14:02:49Z",
          "points_tick": 0,
          "points_capture": 0
        },
        {
          "id": "95-38",
          "type": "Tower",
          "owner": "Green",
          "last_flipped": "2025-04-15T12:23:50Z",
          "claimed_by": "D45CCA10-E809-E411-A006-AC162DAAE275",
          "claimed_at": "2025-04-15T14:13:39Z",
          "points_tick": 10,
          "points_capture": 40,
          "yaks_delivered": 70,
          "guild_upgrades": [
            583,
            147,
            483,
            178,
            590,
            389
          ]
        },
        {
          "id": "95-50",
          "type": "Camp",
          "owner": "Red",
          "last_flipped": "2025-04-18T14:33:31Z",
          "claimed_by": null,
          "claimed_at": null,
          "points_tick": 2,
          "points_capture": 2,
          "yaks_delivered": 0,
          "guild_upgrades": []
        },
        {
          "id": "95-63",
          "type": "Ruins",
          "owner": "Green",
          "last_flipped": "2025-04-18T13:23:11Z",
          "points_tick": 0,
          "points_capture": 0
        }
      ],
      "deaths": {
        "red": 3050,
        "blue": 2338,
        "green": 2336
      },
      "kills": {
        "red": 1758,
        "blue": 1588,
        "green": 4115
      }
    }
  ]
};


// https://api.guildwars2.com/v2/wvw/objectives?ids=all
const objectives = new Map([
  {
    "id": "1099-99",
    "name": "Hamm's Lab",
    "sector_id": 1314,
    "type": "Camp",
    "map_type": "RedHome",
    "map_id": 1099,
    "upgrade_id": 6,
    "coord": [
      10743.8,
      9492.51,
      -2955
    ],
    "label_coord": [
      10839.8,
      9550.34
    ],
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DGMAAABLBAAA]"
  },
  {
    "id": "1143-99",
    "name": "Zakk's Lab",
    "sector_id": 1358,
    "type": "Camp",
    "map_type": "BlueHome",
    "map_id": 1143,
    "upgrade_id": 6,
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DGMAAAB3BAAA]"
  },
  {
    "id": "1102-99",
    "name": "Lesh's Lab",
    "sector_id": 1291,
    "type": "Camp",
    "map_type": "GreenHome",
    "map_id": 1102,
    "upgrade_id": 6,
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DGMAAABOBAAA]"
  },
  {
    "id": "1099-100",
    "name": "Bauer Farmstead",
    "sector_id": 1280,
    "type": "Camp",
    "map_type": "RedHome",
    "map_id": 1099,
    "upgrade_id": 38,
    "coord": [
      11891.4,
      11286.6,
      -4736.73
    ],
    "label_coord": [
      11746.4,
      11304.5
    ],
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DGQAAABLBAAA]"
  },
  {
    "id": "1143-100",
    "name": "Gee Farmstead",
    "sector_id": 1292,
    "type": "Camp",
    "map_type": "BlueHome",
    "map_id": 1143,
    "upgrade_id": 38,
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DGQAAAB3BAAA]"
  },
  {
    "id": "1102-100",
    "name": "Barrett Farmstead",
    "sector_id": 1345,
    "type": "Camp",
    "map_type": "GreenHome",
    "map_id": 1102,
    "upgrade_id": 38,
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DGQAAABOBAAA]"
  },
  {
    "id": "1099-101",
    "name": "McLain's Encampment",
    "sector_id": 1286,
    "type": "Camp",
    "map_type": "RedHome",
    "map_id": 1099,
    "upgrade_id": 15,
    "coord": [
      9584.13,
      11316.1,
      -3877.82
    ],
    "label_coord": [
      9774.06,
      11228.4
    ],
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DGUAAABLBAAA]"
  },
  {
    "id": "1143-101",
    "name": "Habib's Encampment",
    "sector_id": 1306,
    "type": "Camp",
    "map_type": "BlueHome",
    "map_id": 1143,
    "upgrade_id": 15,
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DGUAAAB3BAAA]"
  },
  {
    "id": "1102-101",
    "name": "Patrick's Encampment",
    "sector_id": 1342,
    "type": "Camp",
    "map_type": "GreenHome",
    "map_id": 1102,
    "upgrade_id": 15,
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DGUAAABOBAAA]"
  },
  {
    "id": "1099-102",
    "name": "O'del Academy",
    "sector_id": 1352,
    "type": "Tower",
    "map_type": "RedHome",
    "map_id": 1099,
    "upgrade_id": 35,
    "coord": [
      9831.82,
      9507.67,
      -2897.5
    ],
    "label_coord": [
      9792.23,
      9449.97
    ],
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DGYAAABLBAAA]"
  },
  {
    "id": "1143-102",
    "name": "Kay'li Academy",
    "sector_id": 1337,
    "type": "Tower",
    "map_type": "BlueHome",
    "map_id": 1143,
    "upgrade_id": 35,
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DGYAAAB3BAAA]"
  },
  {
    "id": "1102-102",
    "name": "Y'lan Academy",
    "sector_id": 1336,
    "type": "Tower",
    "map_type": "GreenHome",
    "map_id": 1102,
    "upgrade_id": 35,
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DGYAAABOBAAA]"
  },
  {
    "id": "1099-104",
    "name": "Eternal Necropolis",
    "sector_id": 1308,
    "type": "Tower",
    "map_type": "RedHome",
    "map_id": 1099,
    "upgrade_id": 36,
    "coord": [
      11739.2,
      9654.33,
      -4452.81
    ],
    "label_coord": [
      11844.7,
      9567.49
    ],
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DGgAAABLBAAA]"
  },
  {
    "id": "1143-104",
    "name": "Undying Necropolis",
    "sector_id": 1355,
    "type": "Tower",
    "map_type": "BlueHome",
    "map_id": 1143,
    "upgrade_id": 36,
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DGgAAAB3BAAA]"
  },
  {
    "id": "1102-104",
    "name": "Deathless Necropolis",
    "sector_id": 1325,
    "type": "Tower",
    "map_type": "GreenHome",
    "map_id": 1102,
    "upgrade_id": 36,
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DGgAAABOBAAA]"
  },
  {
    "id": "1099-105",
    "name": "Crankshaft Depot",
    "sector_id": 1354,
    "type": "Tower",
    "map_type": "RedHome",
    "map_id": 1099,
    "upgrade_id": 53,
    "coord": [
      11256.9,
      11551.1,
      -5219.09
    ],
    "label_coord": [
      11263,
      11695.1
    ],
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DGkAAABLBAAA]"
  },
  {
    "id": "1143-105",
    "name": "Flywheel Depot",
    "sector_id": 1332,
    "type": "Tower",
    "map_type": "BlueHome",
    "map_id": 1143,
    "upgrade_id": 53,
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DGkAAAB3BAAA]"
  },
  {
    "id": "1102-105",
    "name": "Sparkplug Depot",
    "sector_id": 1302,
    "type": "Tower",
    "map_type": "GreenHome",
    "map_id": 1102,
    "upgrade_id": 53,
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DGkAAABOBAAA]"
  },
  {
    "id": "1099-106",
    "name": "Blistering Undercroft",
    "sector_id": 1351,
    "type": "Keep",
    "map_type": "RedHome",
    "map_id": 1099,
    "upgrade_id": 40,
    "coord": [
      9327.72,
      10634.1,
      -3714.37
    ],
    "label_coord": [
      9857.8,
      10565.3
    ],
    "marker": "https://render.guildwars2.com/file/DB580419C8AD9449309A96C8E7C3D61631020EBB/102535.png",
    "chat_link": "[&DGoAAABLBAAA]"
  },
  {
    "id": "1143-106",
    "name": "Torrid Undercroft",
    "sector_id": 1298,
    "type": "Keep",
    "map_type": "BlueHome",
    "map_id": 1143,
    "upgrade_id": 40,
    "marker": "https://render.guildwars2.com/file/DB580419C8AD9449309A96C8E7C3D61631020EBB/102535.png",
    "chat_link": "[&DGoAAAB3BAAA]"
  },
  {
    "id": "1102-106",
    "name": "Scorching Undercroft",
    "sector_id": 1295,
    "type": "Keep",
    "map_type": "GreenHome",
    "map_id": 1102,
    "upgrade_id": 40,
    "marker": "https://render.guildwars2.com/file/DB580419C8AD9449309A96C8E7C3D61631020EBB/102535.png",
    "chat_link": "[&DGoAAABOBAAA]"
  },
  {
    "id": "1099-118",
    "name": "Higgins's Ascent",
    "sector_id": 1420,
    "type": "Ruins",
    "map_type": "RedHome",
    "map_id": 1099,
    "coord": [
      10913.3,
      11198.2,
      -992.897
    ],
    "label_coord": [
      10949.5,
      11207.5
    ],
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DHYAAABLBAAA]"
  },
  {
    "id": "1143-118",
    "name": "Higgins's Ascent",
    "sector_id": 1430,
    "type": "Ruins",
    "map_type": "BlueHome",
    "map_id": 1143,
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DHYAAAB3BAAA]"
  },
  {
    "id": "1102-118",
    "name": "Higgins's Ascent",
    "sector_id": 1427,
    "type": "Ruins",
    "map_type": "GreenHome",
    "map_id": 1102,
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DHYAAABOBAAA]"
  },
  {
    "id": "1099-107",
    "name": "Border",
    "sector_id": 1311,
    "type": "Spawn",
    "map_type": "RedHome",
    "map_id": 1099,
    "upgrade_id": 2,
    "label_coord": [
      12008.6,
      11771
    ],
    "chat_link": "[&DGsAAABLBAAA]"
  },
  {
    "id": "1143-107",
    "name": "Border",
    "sector_id": 1349,
    "type": "Spawn",
    "map_type": "BlueHome",
    "map_id": 1143,
    "upgrade_id": 2,
    "chat_link": "[&DGsAAAB3BAAA]"
  },
  {
    "id": "1102-107",
    "name": "Border",
    "sector_id": 1310,
    "type": "Spawn",
    "map_type": "GreenHome",
    "map_id": 1102,
    "upgrade_id": 2,
    "chat_link": "[&DGsAAABOBAAA]"
  },
  {
    "id": "1099-119",
    "name": "Bearce's Dwelling",
    "sector_id": 1421,
    "type": "Ruins",
    "map_type": "RedHome",
    "map_id": 1099,
    "coord": [
      10446.7,
      10761.6,
      -620.871
    ],
    "label_coord": [
      10429.1,
      10651.1
    ],
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DHcAAABLBAAA]"
  },
  {
    "id": "1143-119",
    "name": "Bearce's Dwelling",
    "sector_id": 1423,
    "type": "Ruins",
    "map_type": "BlueHome",
    "map_id": 1143,
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DHcAAAB3BAAA]"
  },
  {
    "id": "1102-119",
    "name": "Bearce's Dwelling",
    "sector_id": 1445,
    "type": "Ruins",
    "map_type": "GreenHome",
    "map_id": 1102,
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DHcAAABOBAAA]"
  },
  {
    "id": "1099-108",
    "name": "Border",
    "sector_id": 1350,
    "type": "Spawn",
    "map_type": "RedHome",
    "map_id": 1099,
    "upgrade_id": 51,
    "label_coord": [
      9640.43,
      11765
    ],
    "chat_link": "[&DGwAAABLBAAA]"
  },
  {
    "id": "1143-108",
    "name": "Border",
    "sector_id": 1285,
    "type": "Spawn",
    "map_type": "BlueHome",
    "map_id": 1143,
    "upgrade_id": 51,
    "chat_link": "[&DGwAAAB3BAAA]"
  },
  {
    "id": "1102-108",
    "name": "Border",
    "sector_id": 1359,
    "type": "Spawn",
    "map_type": "GreenHome",
    "map_id": 1102,
    "upgrade_id": 51,
    "chat_link": "[&DGwAAABOBAAA]"
  },
  {
    "id": "1099-109",
    "name": "Roy's Refuge",
    "sector_id": 1322,
    "type": "Camp",
    "map_type": "RedHome",
    "map_id": 1099,
    "upgrade_id": 25,
    "coord": [
      12097.5,
      10018.3,
      -1025.05
    ],
    "label_coord": [
      11948.6,
      10053.4
    ],
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DG0AAABLBAAA]"
  },
  {
    "id": "1143-109",
    "name": "Olivier's Refuge",
    "sector_id": 1304,
    "type": "Camp",
    "map_type": "BlueHome",
    "map_id": 1143,
    "upgrade_id": 25,
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DG0AAAB3BAAA]"
  },
  {
    "id": "1102-109",
    "name": "Norfolk's Refuge",
    "sector_id": 1290,
    "type": "Camp",
    "map_type": "GreenHome",
    "map_id": 1102,
    "upgrade_id": 25,
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DG0AAABOBAAA]"
  },
  {
    "id": "1099-120",
    "name": "Zak's Overlook",
    "sector_id": 1441,
    "type": "Ruins",
    "map_type": "RedHome",
    "map_id": 1099,
    "coord": [
      10989.5,
      10778.3,
      -941.543
    ],
    "label_coord": [
      11115.1,
      10773.2
    ],
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DHgAAABLBAAA]"
  },
  {
    "id": "1143-120",
    "name": "Zak's Overlook",
    "sector_id": 1450,
    "type": "Ruins",
    "map_type": "BlueHome",
    "map_id": 1143,
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DHgAAAB3BAAA]"
  },
  {
    "id": "1102-120",
    "name": "Zak's Overlook",
    "sector_id": 1433,
    "type": "Ruins",
    "map_type": "GreenHome",
    "map_id": 1102,
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DHgAAABOBAAA]"
  },
  {
    "id": "1099-110",
    "name": "Parched Outpost",
    "sector_id": 1277,
    "type": "Tower",
    "map_type": "RedHome",
    "map_id": 1099,
    "upgrade_id": 14,
    "coord": [
      10243.9,
      11331.3,
      -5557.72
    ],
    "label_coord": [
      10126.5,
      11539.6
    ],
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DG4AAABLBAAA]"
  },
  {
    "id": "1143-110",
    "name": "Barren Outpost",
    "sector_id": 1328,
    "type": "Tower",
    "map_type": "BlueHome",
    "map_id": 1143,
    "upgrade_id": 14,
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DG4AAAB3BAAA]"
  },
  {
    "id": "1102-110",
    "name": "Withered Outpost",
    "sector_id": 1283,
    "type": "Tower",
    "map_type": "GreenHome",
    "map_id": 1102,
    "upgrade_id": 14,
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DG4AAABOBAAA]"
  },
  {
    "id": "1099-113",
    "name": "Stoic Rampart",
    "sector_id": 1303,
    "type": "Keep",
    "map_type": "RedHome",
    "map_id": 1099,
    "upgrade_id": 3,
    "coord": [
      10776.6,
      10120.4,
      -4120.01
    ],
    "label_coord": [
      10746.3,
      10050.6
    ],
    "marker": "https://render.guildwars2.com/file/DB580419C8AD9449309A96C8E7C3D61631020EBB/102535.png",
    "chat_link": "[&DHEAAABLBAAA]"
  },
  {
    "id": "1143-113",
    "name": "Hardened Rampart",
    "sector_id": 1293,
    "type": "Keep",
    "map_type": "BlueHome",
    "map_id": 1143,
    "upgrade_id": 3,
    "marker": "https://render.guildwars2.com/file/DB580419C8AD9449309A96C8E7C3D61631020EBB/102535.png",
    "chat_link": "[&DHEAAAB3BAAA]"
  },
  {
    "id": "1102-113",
    "name": "Impassive Rampart",
    "sector_id": 1318,
    "type": "Keep",
    "map_type": "GreenHome",
    "map_id": 1102,
    "upgrade_id": 3,
    "marker": "https://render.guildwars2.com/file/DB580419C8AD9449309A96C8E7C3D61631020EBB/102535.png",
    "chat_link": "[&DHEAAABOBAAA]"
  },
  {
    "id": "1099-114",
    "name": "Osprey's Palace",
    "sector_id": 1300,
    "type": "Keep",
    "map_type": "RedHome",
    "map_id": 1099,
    "upgrade_id": 5,
    "coord": [
      12203,
      10706.2,
      -4254.64
    ],
    "label_coord": [
      11768.6,
      10799.9
    ],
    "marker": "https://render.guildwars2.com/file/DB580419C8AD9449309A96C8E7C3D61631020EBB/102535.png",
    "chat_link": "[&DHIAAABLBAAA]"
  },
  {
    "id": "1143-114",
    "name": "Shrike's Palace",
    "sector_id": 1356,
    "type": "Keep",
    "map_type": "BlueHome",
    "map_id": 1143,
    "upgrade_id": 5,
    "marker": "https://render.guildwars2.com/file/DB580419C8AD9449309A96C8E7C3D61631020EBB/102535.png",
    "chat_link": "[&DHIAAAB3BAAA]"
  },
  {
    "id": "1102-114",
    "name": "Harrier's Palace",
    "sector_id": 1287,
    "type": "Keep",
    "map_type": "GreenHome",
    "map_id": 1102,
    "upgrade_id": 5,
    "marker": "https://render.guildwars2.com/file/DB580419C8AD9449309A96C8E7C3D61631020EBB/102535.png",
    "chat_link": "[&DHIAAABOBAAA]"
  },
  {
    "id": "1099-121",
    "name": "Darra's Maze",
    "sector_id": 1444,
    "type": "Ruins",
    "map_type": "RedHome",
    "map_id": 1099,
    "coord": [
      10399.4,
      11059.5,
      -1255.37
    ],
    "label_coord": [
      10479,
      11185.6
    ],
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DHkAAABLBAAA]"
  },
  {
    "id": "1143-121",
    "name": "Darra's Maze",
    "sector_id": 1438,
    "type": "Ruins",
    "map_type": "BlueHome",
    "map_id": 1143,
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DHkAAAB3BAAA]"
  },
  {
    "id": "1102-121",
    "name": "Darra's Maze",
    "sector_id": 1449,
    "type": "Ruins",
    "map_type": "GreenHome",
    "map_id": 1102,
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DHkAAABOBAAA]"
  },
  {
    "id": "1099-115",
    "name": "Boettiger's Hideaway",
    "sector_id": 1316,
    "type": "Camp",
    "map_type": "RedHome",
    "map_id": 1099,
    "upgrade_id": 30,
    "coord": [
      9310.12,
      10008,
      -1283.35
    ],
    "label_coord": [
      9467.03,
      9996.46
    ],
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DHMAAABLBAAA]"
  },
  {
    "id": "1143-115",
    "name": "Berdrow's Hideaway",
    "sector_id": 1357,
    "type": "Camp",
    "map_type": "BlueHome",
    "map_id": 1143,
    "upgrade_id": 30,
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DHMAAAB3BAAA]"
  },
  {
    "id": "1102-115",
    "name": "Hughe's Hideaway",
    "sector_id": 1324,
    "type": "Camp",
    "map_type": "GreenHome",
    "map_id": 1102,
    "upgrade_id": 30,
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DHMAAABOBAAA]"
  },
  {
    "id": "1099-122",
    "name": "Tilly's Encampment",
    "sector_id": 1436,
    "type": "Ruins",
    "map_type": "RedHome",
    "map_id": 1099,
    "coord": [
      10725.3,
      10453.5,
      -235.954
    ],
    "label_coord": [
      10799.4,
      10509.5
    ],
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DHoAAABLBAAA]"
  },
  {
    "id": "1143-122",
    "name": "Tilly's Encampment",
    "sector_id": 1442,
    "type": "Ruins",
    "map_type": "BlueHome",
    "map_id": 1143,
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DHoAAAB3BAAA]"
  },
  {
    "id": "1102-122",
    "name": "Tilly's Encampment",
    "sector_id": 1447,
    "type": "Ruins",
    "map_type": "GreenHome",
    "map_id": 1102,
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DHoAAABOBAAA]"
  },
  {
    "id": "1099-116",
    "name": "Dustwhisper Well",
    "sector_id": 1296,
    "type": "Camp",
    "map_type": "RedHome",
    "map_id": 1099,
    "upgrade_id": 34,
    "coord": [
      10754.8,
      11854.4,
      -2801.74
    ],
    "label_coord": [
      10802.7,
      11730.6
    ],
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DHQAAABLBAAA]"
  },
  {
    "id": "1143-116",
    "name": "Lastgasp Well",
    "sector_id": 1301,
    "type": "Camp",
    "map_type": "BlueHome",
    "map_id": 1143,
    "upgrade_id": 34,
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DHQAAAB3BAAA]"
  },
  {
    "id": "1102-116",
    "name": "Smashedhope Well",
    "sector_id": 1338,
    "type": "Camp",
    "map_type": "GreenHome",
    "map_id": 1102,
    "upgrade_id": 34,
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DHQAAABOBAAA]"
  },
  {
    "id": "1099-117",
    "name": "Citadel",
    "sector_id": 1343,
    "type": "Spawn",
    "map_type": "RedHome",
    "map_id": 1099,
    "upgrade_id": 8,
    "label_coord": [
      10817.2,
      9156.98
    ],
    "chat_link": "[&DHUAAABLBAAA]"
  },
  {
    "id": "1143-117",
    "name": "Citadel",
    "sector_id": 1279,
    "type": "Spawn",
    "map_type": "BlueHome",
    "map_id": 1143,
    "upgrade_id": 8,
    "chat_link": "[&DHUAAAB3BAAA]"
  },
  {
    "id": "1102-117",
    "name": "Citadel",
    "sector_id": 1315,
    "type": "Spawn",
    "map_type": "GreenHome",
    "map_id": 1102,
    "upgrade_id": 8,
    "chat_link": "[&DHUAAABOBAAA]"
  },
  {
    "id": "96-62",
    "name": "Temple of Lost Prayers",
    "sector_id": 1381,
    "type": "Ruins",
    "map_type": "BlueHome",
    "map_id": 96,
    "coord": [
      14065.1,
      13339.5,
      -1168
    ],
    "label_coord": [
      13986.5,
      13254.6
    ],
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DD4AAABgAAAA]"
  },
  {
    "id": "94-62",
    "name": "Temple of Lost Prayers",
    "sector_id": 1387,
    "type": "Ruins",
    "map_type": "RedHome",
    "map_id": 94,
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DD4AAABeAAAA]"
  },
  {
    "id": "95-62",
    "name": "Temple of the Fallen",
    "sector_id": 1376,
    "type": "Ruins",
    "map_type": "GreenHome",
    "map_id": 95,
    "coord": [
      6897.13,
      13979.5,
      -1168
    ],
    "label_coord": [
      6818.5,
      13894.6
    ],
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DD4AAABfAAAA]"
  },
  {
    "id": "94-35",
    "name": "Greenbriar",
    "sector_id": 964,
    "type": "Tower",
    "map_type": "RedHome",
    "map_id": 94,
    "upgrade_id": 20,
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DCMAAABeAAAA]"
  },
  {
    "id": "96-35",
    "name": "Redbriar",
    "sector_id": 990,
    "type": "Tower",
    "map_type": "BlueHome",
    "map_id": 96,
    "upgrade_id": 20,
    "coord": [
      13688.9,
      13339,
      -1892.9
    ],
    "label_coord": [
      13676.6,
      13457.4
    ],
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DCMAAABgAAAA]"
  },
  {
    "id": "95-35",
    "name": "Bluebriar",
    "sector_id": 1009,
    "type": "Tower",
    "map_type": "GreenHome",
    "map_id": 95,
    "upgrade_id": 20,
    "coord": [
      6520.89,
      13979,
      -1892.9
    ],
    "label_coord": [
      6508.56,
      14097.4
    ],
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DCMAAABfAAAA]"
  },
  {
    "id": "94-103",
    "name": "Border",
    "sector_id": 966,
    "type": "Spawn",
    "map_type": "RedHome",
    "map_id": 94,
    "upgrade_id": 37,
    "chat_link": "[&DGcAAABeAAAA]"
  },
  {
    "id": "96-103",
    "name": "Border",
    "sector_id": 974,
    "type": "Spawn",
    "map_type": "BlueHome",
    "map_id": 96,
    "upgrade_id": 37,
    "label_coord": [
      14830.2,
      14041.8
    ],
    "chat_link": "[&DGcAAABgAAAA]"
  },
  {
    "id": "95-103",
    "name": "Border",
    "sector_id": 997,
    "type": "Spawn",
    "map_type": "GreenHome",
    "map_id": 95,
    "upgrade_id": 37,
    "label_coord": [
      7662.21,
      14681.8
    ],
    "chat_link": "[&DGcAAABfAAAA]"
  },
  {
    "id": "94-32",
    "name": "Etheron Hills",
    "sector_id": 962,
    "type": "Keep",
    "map_type": "RedHome",
    "map_id": 94,
    "upgrade_id": 9,
    "marker": "https://render.guildwars2.com/file/DB580419C8AD9449309A96C8E7C3D61631020EBB/102535.png",
    "chat_link": "[&DCAAAABeAAAA]"
  },
  {
    "id": "96-32",
    "name": "Askalion Hills",
    "sector_id": 979,
    "type": "Keep",
    "map_type": "BlueHome",
    "map_id": 96,
    "upgrade_id": 9,
    "coord": [
      15252.2,
      12880.7,
      -3107.91
    ],
    "label_coord": [
      14891,
      12896.1
    ],
    "marker": "https://render.guildwars2.com/file/DB580419C8AD9449309A96C8E7C3D61631020EBB/102535.png",
    "chat_link": "[&DCAAAABgAAAA]"
  },
  {
    "id": "95-32",
    "name": "Shadaran Hills",
    "sector_id": 996,
    "type": "Keep",
    "map_type": "GreenHome",
    "map_id": 95,
    "upgrade_id": 9,
    "coord": [
      8084.25,
      13520.7,
      -3107.91
    ],
    "label_coord": [
      7723.04,
      13536.1
    ],
    "marker": "https://render.guildwars2.com/file/DB580419C8AD9449309A96C8E7C3D61631020EBB/102535.png",
    "chat_link": "[&DCAAAABfAAAA]"
  },
  {
    "id": "94-33",
    "name": "Dreaming Bay",
    "sector_id": 957,
    "type": "Keep",
    "map_type": "RedHome",
    "map_id": 94,
    "upgrade_id": 16,
    "marker": "https://render.guildwars2.com/file/DB580419C8AD9449309A96C8E7C3D61631020EBB/102535.png",
    "chat_link": "[&DCEAAABeAAAA]"
  },
  {
    "id": "96-33",
    "name": "Ascension Bay",
    "sector_id": 973,
    "type": "Keep",
    "map_type": "BlueHome",
    "map_id": 96,
    "upgrade_id": 16,
    "coord": [
      13035.1,
      12956.6,
      -300.694
    ],
    "label_coord": [
      13153.8,
      12942.5
    ],
    "marker": "https://render.guildwars2.com/file/DB580419C8AD9449309A96C8E7C3D61631020EBB/102535.png",
    "chat_link": "[&DCEAAABgAAAA]"
  },
  {
    "id": "95-33",
    "name": "Dreadfall Bay",
    "sector_id": 999,
    "type": "Keep",
    "map_type": "GreenHome",
    "map_id": 95,
    "upgrade_id": 16,
    "coord": [
      5867.06,
      13596.6,
      -300.694
    ],
    "label_coord": [
      5985.83,
      13582.5
    ],
    "marker": "https://render.guildwars2.com/file/DB580419C8AD9449309A96C8E7C3D61631020EBB/102535.png",
    "chat_link": "[&DCEAAABfAAAA]"
  },
  {
    "id": "96-65",
    "name": "Orchard Overlook",
    "sector_id": 1384,
    "type": "Ruins",
    "map_type": "BlueHome",
    "map_id": 96,
    "coord": [
      14327.1,
      12757,
      -711
    ],
    "label_coord": [
      14232.3,
      12790.1
    ],
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DEEAAABgAAAA]"
  },
  {
    "id": "94-65",
    "name": "Orchard Overlook",
    "sector_id": 1375,
    "type": "Ruins",
    "map_type": "RedHome",
    "map_id": 94,
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DEEAAABeAAAA]"
  },
  {
    "id": "95-65",
    "name": "Cohen's Overlook",
    "sector_id": 1377,
    "type": "Ruins",
    "map_type": "GreenHome",
    "map_id": 95,
    "coord": [
      7159.09,
      13397,
      -711
    ],
    "label_coord": [
      7064.26,
      13430.1
    ],
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DEEAAABfAAAA]"
  },
  {
    "id": "94-38",
    "name": "Longview",
    "sector_id": 955,
    "type": "Tower",
    "map_type": "RedHome",
    "map_id": 94,
    "upgrade_id": 44,
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DCYAAABeAAAA]"
  },
  {
    "id": "96-38",
    "name": "Woodhaven",
    "sector_id": 988,
    "type": "Tower",
    "map_type": "BlueHome",
    "map_id": 96,
    "upgrade_id": 44,
    "coord": [
      13444.8,
      12078.2,
      -3758.65
    ],
    "label_coord": [
      13336.2,
      11919.7
    ],
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DCYAAABgAAAA]"
  },
  {
    "id": "95-38",
    "name": "Sunnyhill",
    "sector_id": 1007,
    "type": "Tower",
    "map_type": "GreenHome",
    "map_id": 95,
    "upgrade_id": 44,
    "coord": [
      6276.77,
      12718.2,
      -3758.65
    ],
    "label_coord": [
      6168.15,
      12559.7
    ],
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DCYAAABfAAAA]"
  },
  {
    "id": "94-39",
    "name": "The Godsword",
    "sector_id": 953,
    "type": "Camp",
    "map_type": "RedHome",
    "map_id": 94,
    "upgrade_id": 31,
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DCcAAABeAAAA]"
  },
  {
    "id": "96-39",
    "name": "The Spiritholme",
    "sector_id": 978,
    "type": "Camp",
    "map_type": "BlueHome",
    "map_id": 96,
    "upgrade_id": 31,
    "coord": [
      14082.8,
      11228.4,
      -3676.89
    ],
    "label_coord": [
      14158.7,
      11352.9
    ],
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DCcAAABgAAAA]"
  },
  {
    "id": "95-39",
    "name": "The Titanpaw",
    "sector_id": 998,
    "type": "Camp",
    "map_type": "GreenHome",
    "map_id": 95,
    "upgrade_id": 31,
    "coord": [
      6914.78,
      11868.4,
      -3676.89
    ],
    "label_coord": [
      6990.69,
      11992.9
    ],
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DCcAAABfAAAA]"
  },
  {
    "id": "96-64",
    "name": "Bauer's Estate",
    "sector_id": 1374,
    "type": "Ruins",
    "map_type": "BlueHome",
    "map_id": 96,
    "coord": [
      13859.2,
      12703.1,
      -393
    ],
    "label_coord": [
      13863.2,
      12770.8
    ],
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DEAAAABgAAAA]"
  },
  {
    "id": "94-64",
    "name": "Bauer's Estate",
    "sector_id": 1379,
    "type": "Ruins",
    "map_type": "RedHome",
    "map_id": 94,
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DEAAAABeAAAA]"
  },
  {
    "id": "95-64",
    "name": "Gertzz's Estate",
    "sector_id": 1388,
    "type": "Ruins",
    "map_type": "GreenHome",
    "map_id": 95,
    "coord": [
      6691.21,
      13343.1,
      -393
    ],
    "label_coord": [
      6695.18,
      13410.8
    ],
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DEAAAABfAAAA]"
  },
  {
    "id": "94-37",
    "name": "Garrison",
    "sector_id": 952,
    "type": "Keep",
    "map_type": "RedHome",
    "map_id": 94,
    "upgrade_id": 19,
    "marker": "https://render.guildwars2.com/file/DB580419C8AD9449309A96C8E7C3D61631020EBB/102535.png",
    "chat_link": "[&DCUAAABeAAAA]"
  },
  {
    "id": "96-37",
    "name": "Garrison",
    "sector_id": 976,
    "type": "Keep",
    "map_type": "BlueHome",
    "map_id": 96,
    "upgrade_id": 19,
    "coord": [
      14056.6,
      12430.9,
      -2800.76
    ],
    "label_coord": [
      14039.4,
      12329.5
    ],
    "marker": "https://render.guildwars2.com/file/DB580419C8AD9449309A96C8E7C3D61631020EBB/102535.png",
    "chat_link": "[&DCUAAABgAAAA]"
  },
  {
    "id": "95-37",
    "name": "Garrison",
    "sector_id": 992,
    "type": "Keep",
    "map_type": "GreenHome",
    "map_id": 95,
    "upgrade_id": 19,
    "coord": [
      6888.59,
      13070.9,
      -2800.76
    ],
    "label_coord": [
      6871.41,
      12969.5
    ],
    "marker": "https://render.guildwars2.com/file/DB580419C8AD9449309A96C8E7C3D61631020EBB/102535.png",
    "chat_link": "[&DCUAAABfAAAA]"
  },
  {
    "id": "94-53",
    "name": "Greenvale Refuge",
    "sector_id": 971,
    "type": "Camp",
    "map_type": "RedHome",
    "map_id": 94,
    "upgrade_id": 29,
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DDUAAABeAAAA]"
  },
  {
    "id": "96-53",
    "name": "Redvale Refuge",
    "sector_id": 985,
    "type": "Camp",
    "map_type": "BlueHome",
    "map_id": 96,
    "upgrade_id": 29,
    "coord": [
      13262.3,
      13457.1,
      -687.909
    ],
    "label_coord": [
      13200.4,
      13475
    ],
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DDUAAABgAAAA]"
  },
  {
    "id": "95-53",
    "name": "Bluevale Refuge",
    "sector_id": 1005,
    "type": "Camp",
    "map_type": "GreenHome",
    "map_id": 95,
    "upgrade_id": 29,
    "coord": [
      6094.29,
      14097.1,
      -687.909
    ],
    "label_coord": [
      6032.39,
      14115
    ],
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DDUAAABfAAAA]"
  },
  {
    "id": "94-111",
    "name": "Citadel",
    "sector_id": 941,
    "type": "Spawn",
    "map_type": "RedHome",
    "map_id": 94,
    "upgrade_id": 23,
    "chat_link": "[&DG8AAABeAAAA]"
  },
  {
    "id": "96-111",
    "name": "Citadel",
    "sector_id": 980,
    "type": "Spawn",
    "map_type": "BlueHome",
    "map_id": 96,
    "upgrade_id": 23,
    "label_coord": [
      14101.5,
      11676.5
    ],
    "chat_link": "[&DG8AAABgAAAA]"
  },
  {
    "id": "95-111",
    "name": "Citadel",
    "sector_id": 993,
    "type": "Spawn",
    "map_type": "GreenHome",
    "map_id": 95,
    "upgrade_id": 23,
    "label_coord": [
      6933.52,
      12316.5
    ],
    "chat_link": "[&DG8AAABfAAAA]"
  },
  {
    "id": "94-112",
    "name": "Border",
    "sector_id": 967,
    "type": "Spawn",
    "map_type": "RedHome",
    "map_id": 94,
    "upgrade_id": 49,
    "chat_link": "[&DHAAAABeAAAA]"
  },
  {
    "id": "96-112",
    "name": "Border",
    "sector_id": 977,
    "type": "Spawn",
    "map_type": "BlueHome",
    "map_id": 96,
    "upgrade_id": 49,
    "label_coord": [
      13383,
      14026.2
    ],
    "chat_link": "[&DHAAAABgAAAA]"
  },
  {
    "id": "95-112",
    "name": "Border",
    "sector_id": 1000,
    "type": "Spawn",
    "map_type": "GreenHome",
    "map_id": 95,
    "upgrade_id": 49,
    "label_coord": [
      6215.03,
      14666.2
    ],
    "chat_link": "[&DHAAAABfAAAA]"
  },
  {
    "id": "94-52",
    "name": "Arah's Hope",
    "sector_id": 956,
    "type": "Camp",
    "map_type": "RedHome",
    "map_id": 94,
    "upgrade_id": 47,
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DDQAAABeAAAA]"
  },
  {
    "id": "96-52",
    "name": "Godslore",
    "sector_id": 991,
    "type": "Camp",
    "map_type": "BlueHome",
    "map_id": 96,
    "upgrade_id": 47,
    "coord": [
      13211.9,
      12195.7,
      -46.1562
    ],
    "label_coord": [
      13234.1,
      12241.8
    ],
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DDQAAABgAAAA]"
  },
  {
    "id": "95-52",
    "name": "Faithleap",
    "sector_id": 1010,
    "type": "Camp",
    "map_type": "GreenHome",
    "map_id": 95,
    "upgrade_id": 47,
    "coord": [
      6043.87,
      12835.7,
      -46.1562
    ],
    "label_coord": [
      6066.1,
      12881.8
    ],
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DDQAAABfAAAA]"
  },
  {
    "id": "94-51",
    "name": "Astralholme",
    "sector_id": 960,
    "type": "Camp",
    "map_type": "RedHome",
    "map_id": 94,
    "upgrade_id": 21,
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DDMAAABeAAAA]"
  },
  {
    "id": "96-51",
    "name": "Stargrove",
    "sector_id": 986,
    "type": "Camp",
    "map_type": "BlueHome",
    "map_id": 96,
    "upgrade_id": 21,
    "coord": [
      15025.5,
      12168.3,
      -1533.33
    ],
    "label_coord": [
      15092.8,
      12269.5
    ],
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DDMAAABgAAAA]"
  },
  {
    "id": "95-51",
    "name": "Foghaven",
    "sector_id": 995,
    "type": "Camp",
    "map_type": "GreenHome",
    "map_id": 95,
    "upgrade_id": 21,
    "coord": [
      7857.45,
      12808.3,
      -1533.33
    ],
    "label_coord": [
      7924.83,
      12909.5
    ],
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DDMAAABfAAAA]"
  },
  {
    "id": "96-66",
    "name": "Carver's Ascent",
    "sector_id": 1382,
    "type": "Ruins",
    "map_type": "BlueHome",
    "map_id": 96,
    "coord": [
      14362.3,
      13112.1,
      -2742
    ],
    "label_coord": [
      14288.7,
      13102.9
    ],
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DEIAAABgAAAA]"
  },
  {
    "id": "94-66",
    "name": "Carver's Ascent",
    "sector_id": 1385,
    "type": "Ruins",
    "map_type": "RedHome",
    "map_id": 94,
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DEIAAABeAAAA]"
  },
  {
    "id": "95-66",
    "name": "Patrick's Ascent",
    "sector_id": 1380,
    "type": "Ruins",
    "map_type": "GreenHome",
    "map_id": 95,
    "coord": [
      7194.27,
      13752.1,
      -2742
    ],
    "label_coord": [
      7120.7,
      13742.9
    ],
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DEIAAABfAAAA]"
  },
  {
    "id": "94-34",
    "name": "Victor's Lodge",
    "sector_id": 963,
    "type": "Camp",
    "map_type": "RedHome",
    "map_id": 94,
    "upgrade_id": 24,
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DCIAAABeAAAA]"
  },
  {
    "id": "96-34",
    "name": "Champion's Demesne",
    "sector_id": 984,
    "type": "Camp",
    "map_type": "BlueHome",
    "map_id": 96,
    "upgrade_id": 24,
    "coord": [
      14083.2,
      14033.2,
      -307.1
    ],
    "label_coord": [
      14076.6,
      13818.4
    ],
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DCIAAABgAAAA]"
  },
  {
    "id": "95-34",
    "name": "Hero's Lodge",
    "sector_id": 1004,
    "type": "Camp",
    "map_type": "GreenHome",
    "map_id": 95,
    "upgrade_id": 24,
    "coord": [
      6915.25,
      14673.2,
      -307.1
    ],
    "label_coord": [
      6908.6,
      14458.4
    ],
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DCIAAABfAAAA]"
  },
  {
    "id": "94-36",
    "name": "Bluelake",
    "sector_id": 965,
    "type": "Tower",
    "map_type": "RedHome",
    "map_id": 94,
    "upgrade_id": 26,
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DCQAAABeAAAA]"
  },
  {
    "id": "96-36",
    "name": "Greenlake",
    "sector_id": 989,
    "type": "Tower",
    "map_type": "BlueHome",
    "map_id": 96,
    "upgrade_id": 26,
    "coord": [
      14581,
      13409.9,
      -1821.91
    ],
    "label_coord": [
      14468.6,
      13429.9
    ],
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DCQAAABgAAAA]"
  },
  {
    "id": "95-36",
    "name": "Redlake",
    "sector_id": 1008,
    "type": "Tower",
    "map_type": "GreenHome",
    "map_id": 95,
    "upgrade_id": 26,
    "coord": [
      7413.05,
      14049.9,
      -1821.91
    ],
    "label_coord": [
      7300.65,
      14069.9
    ],
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DCQAAABfAAAA]"
  },
  {
    "id": "94-50",
    "name": "Bluewater Lowlands",
    "sector_id": 972,
    "type": "Camp",
    "map_type": "RedHome",
    "map_id": 94,
    "upgrade_id": 22,
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DDIAAABeAAAA]"
  },
  {
    "id": "96-50",
    "name": "Greenwater Lowlands",
    "sector_id": 983,
    "type": "Camp",
    "map_type": "BlueHome",
    "map_id": 96,
    "upgrade_id": 22,
    "coord": [
      15015.7,
      13502.9,
      -10.3619
    ],
    "label_coord": [
      15026,
      13412.9
    ],
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DDIAAABgAAAA]"
  },
  {
    "id": "95-50",
    "name": "Redwater Lowlands",
    "sector_id": 1003,
    "type": "Camp",
    "map_type": "GreenHome",
    "map_id": 95,
    "upgrade_id": 22,
    "coord": [
      7847.75,
      14142.9,
      -10.3619
    ],
    "label_coord": [
      7857.99,
      14052.9
    ],
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DDIAAABfAAAA]"
  },
  {
    "id": "96-63",
    "name": "Battle's Hollow",
    "sector_id": 1386,
    "type": "Ruins",
    "map_type": "BlueHome",
    "map_id": 96,
    "coord": [
      13761,
      13074.7,
      -0.649902
    ],
    "label_coord": [
      13739.4,
      13059
    ],
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DD8AAABgAAAA]"
  },
  {
    "id": "94-63",
    "name": "Battle's Hollow",
    "sector_id": 1378,
    "type": "Ruins",
    "map_type": "RedHome",
    "map_id": 94,
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DD8AAABeAAAA]"
  },
  {
    "id": "95-63",
    "name": "Norfolk's Hollow",
    "sector_id": 1383,
    "type": "Ruins",
    "map_type": "GreenHome",
    "map_id": 95,
    "coord": [
      6593,
      13714.7,
      -0.649902
    ],
    "label_coord": [
      6571.42,
      13699
    ],
    "marker": "https://render.guildwars2.com/file/52B43242E55961770D78B80ED77BC764F0E57BF2/1635237.png",
    "chat_link": "[&DD8AAABfAAAA]"
  },
  {
    "id": "94-40",
    "name": "Cliffside",
    "sector_id": 959,
    "type": "Tower",
    "map_type": "RedHome",
    "map_id": 94,
    "upgrade_id": 55,
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DCgAAABeAAAA]"
  },
  {
    "id": "96-40",
    "name": "Dawn's Eyrie",
    "sector_id": 987,
    "type": "Tower",
    "map_type": "BlueHome",
    "map_id": 96,
    "upgrade_id": 55,
    "coord": [
      14683.4,
      12030.3,
      -4839.9
    ],
    "label_coord": [
      14581.2,
      12070.6
    ],
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DCgAAABgAAAA]"
  },
  {
    "id": "95-40",
    "name": "Cragtop",
    "sector_id": 1006,
    "type": "Tower",
    "map_type": "GreenHome",
    "map_id": 95,
    "upgrade_id": 55,
    "coord": [
      7515.42,
      12670.3,
      -4839.9
    ],
    "label_coord": [
      7413.21,
      12710.6
    ],
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DCgAAABfAAAA]"
  },
  {
    "id": "38-11",
    "name": "Aldon's Ledge",
    "sector_id": 882,
    "type": "Tower",
    "map_type": "Center",
    "map_id": 38,
    "upgrade_id": 57,
    "coord": [
      9413.84,
      14792.8,
      -1313.37
    ],
    "label_coord": [
      9428.17,
      14905.6
    ],
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DAsAAAAmAAAA]"
  },
  {
    "id": "38-123",
    "name": "Molevekian Delve",
    "sector_id": 847,
    "type": "Mercenary",
    "map_type": "Center",
    "map_id": 38,
    "label_coord": [
      9833.51,
      14245.6
    ],
    "chat_link": "[&DHsAAAAmAAAA]"
  },
  {
    "id": "38-1",
    "name": "Overlook",
    "sector_id": 843,
    "type": "Keep",
    "map_type": "Center",
    "map_id": 38,
    "upgrade_id": 42,
    "coord": [
      10763.6,
      13655.8,
      -2464.89
    ],
    "label_coord": [
      10716.1,
      13792.9
    ],
    "marker": "https://render.guildwars2.com/file/DB580419C8AD9449309A96C8E7C3D61631020EBB/102535.png",
    "chat_link": "[&DAEAAAAmAAAA]"
  },
  {
    "id": "38-15",
    "name": "Langor Gulch",
    "sector_id": 887,
    "type": "Tower",
    "map_type": "Center",
    "map_id": 38,
    "upgrade_id": 33,
    "coord": [
      11452.7,
      15490.7,
      -2246.3
    ],
    "label_coord": [
      11310.6,
      15472
    ],
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DA8AAAAmAAAA]"
  },
  {
    "id": "38-124",
    "name": "Hill",
    "sector_id": 845,
    "type": "Spawn",
    "map_type": "Center",
    "map_id": 38,
    "label_coord": [
      10529.9,
      13228.1
    ],
    "chat_link": "[&DHwAAAAmAAAA]"
  },
  {
    "id": "38-3",
    "name": "Lowlands",
    "sector_id": 848,
    "type": "Keep",
    "map_type": "Center",
    "map_id": 38,
    "upgrade_id": 52,
    "coord": [
      9604.47,
      15129.9,
      -906.09
    ],
    "label_coord": [
      9846.05,
      15014.7
    ],
    "marker": "https://render.guildwars2.com/file/DB580419C8AD9449309A96C8E7C3D61631020EBB/102535.png",
    "chat_link": "[&DAMAAAAmAAAA]"
  },
  {
    "id": "38-17",
    "name": "Mendon's Gap",
    "sector_id": 890,
    "type": "Tower",
    "map_type": "Center",
    "map_id": 38,
    "upgrade_id": 39,
    "coord": [
      10256.6,
      13514.4,
      -2015.34
    ],
    "label_coord": [
      10167,
      13402.6
    ],
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DBEAAAAmAAAA]"
  },
  {
    "id": "38-7",
    "name": "Danelon Passage",
    "sector_id": 837,
    "type": "Camp",
    "map_type": "Center",
    "map_id": 38,
    "upgrade_id": 27,
    "coord": [
      11037.9,
      15556.2,
      -483.931
    ],
    "label_coord": [
      11043.7,
      15548
    ],
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DAcAAAAmAAAA]"
  },
  {
    "id": "38-125",
    "name": "Orgath Uplands",
    "sector_id": 841,
    "type": "Mercenary",
    "map_type": "Center",
    "map_id": 38,
    "label_coord": [
      11280.2,
      14160.6
    ],
    "chat_link": "[&DH0AAAAmAAAA]"
  },
  {
    "id": "38-126",
    "name": "Darkrait Inlet",
    "sector_id": 842,
    "type": "Mercenary",
    "map_type": "Center",
    "map_id": 38,
    "label_coord": [
      10620.2,
      15475.6
    ],
    "chat_link": "[&DH4AAAAmAAAA]"
  },
  {
    "id": "38-9",
    "name": "Stonemist Castle",
    "sector_id": 833,
    "type": "Castle",
    "map_type": "Center",
    "map_id": 38,
    "upgrade_id": 45,
    "coord": [
      10606.3,
      14580.3,
      -1536.93
    ],
    "label_coord": [
      10643.9,
      14563.8
    ],
    "marker": "https://render.guildwars2.com/file/F0F1DA1C807444F4DF53090343F43BED02E50523/102608.png",
    "chat_link": "[&DAkAAAAmAAAA]"
  },
  {
    "id": "38-5",
    "name": "Pangloss Rise",
    "sector_id": 846,
    "type": "Camp",
    "map_type": "Center",
    "map_id": 38,
    "upgrade_id": 41,
    "coord": [
      11279.8,
      13736.8,
      -835.691
    ],
    "label_coord": [
      11249.6,
      13773
    ],
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DAUAAAAmAAAA]"
  },
  {
    "id": "38-21",
    "name": "Durios Gulch",
    "sector_id": 888,
    "type": "Tower",
    "map_type": "Center",
    "map_id": 38,
    "upgrade_id": 54,
    "coord": [
      11156.4,
      14527.8,
      -1622.95
    ],
    "label_coord": [
      11232.4,
      14584.4
    ],
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DBUAAAAmAAAA]"
  },
  {
    "id": "38-20",
    "name": "Veloka Slope",
    "sector_id": 891,
    "type": "Tower",
    "map_type": "Center",
    "map_id": 38,
    "upgrade_id": 1,
    "coord": [
      11090.4,
      13488.2,
      -2569.23
    ],
    "label_coord": [
      10983.3,
      13552.3
    ],
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DBQAAAAmAAAA]"
  },
  {
    "id": "38-14",
    "name": "Klovan Gully",
    "sector_id": 884,
    "type": "Tower",
    "map_type": "Center",
    "map_id": 38,
    "upgrade_id": 50,
    "coord": [
      10171.8,
      15081.8,
      -495.673
    ],
    "label_coord": [
      10228.6,
      15069.8
    ],
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DA4AAAAmAAAA]"
  },
  {
    "id": "38-13",
    "name": "Jerrifer's Slough",
    "sector_id": 883,
    "type": "Tower",
    "map_type": "Center",
    "map_id": 38,
    "upgrade_id": 28,
    "coord": [
      9805.96,
      15406.4,
      -1659.98
    ],
    "label_coord": [
      9755.78,
      15513.6
    ],
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DA0AAAAmAAAA]"
  },
  {
    "id": "38-6",
    "name": "Speldan Clearcut",
    "sector_id": 844,
    "type": "Camp",
    "map_type": "Center",
    "map_id": 38,
    "upgrade_id": 17,
    "coord": [
      9841.05,
      13545.8,
      -508.295
    ],
    "label_coord": [
      9730.23,
      13640.4
    ],
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DAYAAAAmAAAA]"
  },
  {
    "id": "38-2",
    "name": "Valley",
    "sector_id": 834,
    "type": "Keep",
    "map_type": "Center",
    "map_id": 38,
    "upgrade_id": 11,
    "coord": [
      11496.5,
      15120.6,
      -1786.97
    ],
    "label_coord": [
      11308.9,
      15111.2
    ],
    "marker": "https://render.guildwars2.com/file/DB580419C8AD9449309A96C8E7C3D61631020EBB/102535.png",
    "chat_link": "[&DAIAAAAmAAAA]"
  },
  {
    "id": "38-12",
    "name": "Wildcreek Run",
    "sector_id": 885,
    "type": "Tower",
    "map_type": "Center",
    "map_id": 38,
    "upgrade_id": 7,
    "coord": [
      9906.21,
      14624.6,
      -1014.99
    ],
    "label_coord": [
      9964.66,
      14612.1
    ],
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DAwAAAAmAAAA]"
  },
  {
    "id": "38-16",
    "name": "Quentin Lake",
    "sector_id": 889,
    "type": "Tower",
    "map_type": "Center",
    "map_id": 38,
    "upgrade_id": 13,
    "coord": [
      10850.1,
      15224.4,
      -1052.29
    ],
    "label_coord": [
      10946.4,
      15144.9
    ],
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DBAAAAAmAAAA]"
  },
  {
    "id": "38-22",
    "name": "Bravost Escarpment",
    "sector_id": 886,
    "type": "Tower",
    "map_type": "Center",
    "map_id": 38,
    "upgrade_id": 46,
    "coord": [
      11766.3,
      14793.5,
      -2133.39
    ],
    "label_coord": [
      11765.7,
      14865.1
    ],
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DBYAAAAmAAAA]"
  },
  {
    "id": "38-19",
    "name": "Ogrewatch Cut",
    "sector_id": 892,
    "type": "Tower",
    "map_type": "Center",
    "map_id": 38,
    "upgrade_id": 18,
    "coord": [
      10965.2,
      14054.6,
      -1847.47
    ],
    "label_coord": [
      11009.7,
      13977.7
    ],
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DBMAAAAmAAAA]"
  },
  {
    "id": "38-4",
    "name": "Golanta Clearing",
    "sector_id": 849,
    "type": "Camp",
    "map_type": "Center",
    "map_id": 38,
    "upgrade_id": 10,
    "coord": [
      10202.6,
      15437.1,
      -79.961
    ],
    "label_coord": [
      10160.9,
      15507.6
    ],
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DAQAAAAmAAAA]"
  },
  {
    "id": "38-8",
    "name": "Umberglade Woods",
    "sector_id": 835,
    "type": "Camp",
    "map_type": "Center",
    "map_id": 38,
    "upgrade_id": 56,
    "coord": [
      11565.5,
      14444.8,
      -302.91
    ],
    "label_coord": [
      11680.9,
      14354
    ],
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DAgAAAAmAAAA]"
  },
  {
    "id": "38-10",
    "name": "Rogue's Quarry",
    "sector_id": 851,
    "type": "Camp",
    "map_type": "Center",
    "map_id": 38,
    "upgrade_id": 4,
    "coord": [
      9570.97,
      14423.2,
      -700
    ],
    "label_coord": [
      9607.53,
      14502.3
    ],
    "marker": "https://render.guildwars2.com/file/015D365A08AAE105287A100AAE04529FDAE14155/102532.png",
    "chat_link": "[&DAoAAAAmAAAA]"
  },
  {
    "id": "38-130",
    "name": "Hill",
    "sector_id": 836,
    "type": "Spawn",
    "map_type": "Center",
    "map_id": 38,
    "label_coord": [
      11758.2,
      15519.5
    ],
    "chat_link": "[&DIIAAAAmAAAA]"
  },
  {
    "id": "38-18",
    "name": "Anzalias Pass",
    "sector_id": 893,
    "type": "Tower",
    "map_type": "Center",
    "map_id": 38,
    "upgrade_id": 32,
    "coord": [
      10188.8,
      14082.3,
      -1657.95
    ],
    "label_coord": [
      10222.7,
      13942
    ],
    "marker": "https://render.guildwars2.com/file/ABEC80C79576A103EA33EC66FCB99B77291A2F0D/102531.png",
    "chat_link": "[&DBIAAAAmAAAA]"
  },
  {
    "id": "38-131",
    "name": "Hill",
    "sector_id": 850,
    "type": "Spawn",
    "map_type": "Center",
    "map_id": 38,
    "label_coord": [
      9258.98,
      15497.7
    ],
    "chat_link": "[&DIMAAAAmAAAA]"
  },
  {
    "id": "968-98",
    "name": "Wurm Tunnel",
    "sector_id": 1156,
    "type": "Generic",
    "map_type": "EdgeOfTheMists",
    "map_id": 968,
    "coord": [
      6728.14,
      10184.6,
      -6078.43
    ],
    "label_coord": [
      6794.53,
      10210.8
    ],
    "marker": "https://render.guildwars2.com/file/087491CDD56F7FB998C332360D32FD26A8B2A99D/730428.png",
    "chat_link": "[&DGIAAADIAwAA]"
  },
  {
    "id": "968-96",
    "name": "Airport",
    "sector_id": 1153,
    "type": "Generic",
    "map_type": "EdgeOfTheMists",
    "map_id": 968,
    "coord": [
      7114.23,
      10382.4,
      -4960.05
    ],
    "label_coord": [
      7131.69,
      10334.7
    ],
    "marker": "https://render.guildwars2.com/file/ACCCB1BD617598C0EA9C756EADE53DF36C2578EC/730427.png",
    "chat_link": "[&DGAAAADIAwAA]"
  },
  {
    "id": "968-82",
    "name": "Thunder Hollow Reactor",
    "sector_id": 1168,
    "type": "Resource",
    "map_type": "EdgeOfTheMists",
    "map_id": 968,
    "coord": [
      8273.01,
      10416,
      -3937.12
    ],
    "label_coord": [
      8315.48,
      10433.1
    ],
    "marker": "https://render.guildwars2.com/file/E89AAD28DA43D545D7E3681499049CB73C0E2FEE/102650.png",
    "chat_link": "[&DFIAAADIAwAA]"
  },
  {
    "id": "968-93",
    "name": "Forge",
    "sector_id": 1154,
    "type": "Generic",
    "map_type": "EdgeOfTheMists",
    "map_id": 968,
    "coord": [
      8155.04,
      10773.7,
      -5173.51
    ],
    "label_coord": [
      8161.51,
      10834.1
    ],
    "marker": "https://render.guildwars2.com/file/D1AB541FC3BE12AC5BBB020212BEBE3F5C0C4315/730415.png",
    "chat_link": "[&DF0AAADIAwAA]"
  },
  {
    "id": "968-80",
    "name": "Overgrown Fane Reactor",
    "sector_id": 1162,
    "type": "Resource",
    "map_type": "EdgeOfTheMists",
    "map_id": 968,
    "coord": [
      7518.5,
      9107.75,
      -6106
    ],
    "label_coord": [
      7588.51,
      9066.58
    ],
    "marker": "https://render.guildwars2.com/file/E89AAD28DA43D545D7E3681499049CB73C0E2FEE/102650.png",
    "chat_link": "[&DFAAAADIAwAA]"
  },
  {
    "id": "968-94",
    "name": "Shrine",
    "sector_id": 1164,
    "type": "Generic",
    "map_type": "EdgeOfTheMists",
    "map_id": 968,
    "coord": [
      8801.77,
      10154.3,
      -4610.15
    ],
    "label_coord": [
      8609.68,
      10227.2
    ],
    "marker": "https://render.guildwars2.com/file/B5709941B0352FD4CA3B7AFDA42873D8EFDB15AD/730414.png",
    "chat_link": "[&DF4AAADIAwAA]"
  },
  {
    "id": "968-90",
    "name": "Altar",
    "sector_id": 1160,
    "type": "Generic",
    "map_type": "EdgeOfTheMists",
    "map_id": 968,
    "coord": [
      7124.74,
      9224.54,
      -6550.14
    ],
    "label_coord": [
      7278.81,
      9179.8
    ],
    "marker": "https://render.guildwars2.com/file/DC01EC41D8809B59B85BEEDC45E9556D730BD21A/730413.png",
    "chat_link": "[&DFoAAADIAwAA]"
  },
  {
    "id": "968-97",
    "name": "Workshop",
    "sector_id": 1152,
    "type": "Generic",
    "map_type": "EdgeOfTheMists",
    "map_id": 968,
    "coord": [
      6850.23,
      10729.8,
      -4933.22
    ],
    "label_coord": [
      6900.07,
      10849.6
    ],
    "marker": "https://render.guildwars2.com/file/B34C2E3D0F34FD03F44BB5ED4E18DCDD0059A5C4/730429.png",
    "chat_link": "[&DGEAAADIAwAA]"
  },
  {
    "id": "968-81",
    "name": "Arid Fortress Reactor",
    "sector_id": 1163,
    "type": "Resource",
    "map_type": "EdgeOfTheMists",
    "map_id": 968,
    "coord": [
      6788.73,
      10414.7,
      -6085.8
    ],
    "label_coord": [
      6834.75,
      10483.5
    ],
    "marker": "https://render.guildwars2.com/file/E89AAD28DA43D545D7E3681499049CB73C0E2FEE/102650.png",
    "chat_link": "[&DFEAAADIAwAA]"
  },
  {
    "id": "968-127",
    "name": "Overgrown Docks",
    "sector_id": 1494,
    "type": "Spawn",
    "map_type": "EdgeOfTheMists",
    "map_id": 968,
    "label_coord": [
      7869.38,
      8597.86
    ],
    "chat_link": "[&DH8AAADIAwAA]"
  },
  {
    "id": "968-83",
    "name": "Stonegaze Spire Reactor",
    "sector_id": 1167,
    "type": "Resource",
    "map_type": "EdgeOfTheMists",
    "map_id": 968,
    "coord": [
      7270.05,
      9838.91,
      -5806.97
    ],
    "label_coord": [
      7244.48,
      9787.41
    ],
    "marker": "https://render.guildwars2.com/file/E89AAD28DA43D545D7E3681499049CB73C0E2FEE/102650.png",
    "chat_link": "[&DFMAAADIAwAA]"
  },
  {
    "id": "968-95",
    "name": "Bell Tower",
    "sector_id": 1173,
    "type": "Generic",
    "map_type": "EdgeOfTheMists",
    "map_id": 968,
    "coord": [
      8096.64,
      10297.2,
      -3841.98
    ],
    "label_coord": [
      8102.42,
      10323.7
    ],
    "marker": "https://render.guildwars2.com/file/D4180774DD03A4BC7252B952680E451F16679A72/730410.png",
    "chat_link": "[&DF8AAADIAwAA]"
  },
  {
    "id": "968-91",
    "name": "Observatory",
    "sector_id": 1158,
    "type": "Generic",
    "map_type": "EdgeOfTheMists",
    "map_id": 968,
    "coord": [
      8127.85,
      9029.87,
      -4390.12
    ],
    "label_coord": [
      7942.18,
      9186.29
    ],
    "marker": "https://render.guildwars2.com/file/015CF16C78DFDAD742E1A5613FB74B6463BF4A70/730411.png",
    "chat_link": "[&DFsAAADIAwAA]"
  },
  {
    "id": "968-78",
    "name": "Overgrown Fane",
    "sector_id": 1161,
    "type": "Keep",
    "map_type": "EdgeOfTheMists",
    "map_id": 968,
    "coord": [
      7511.87,
      8690.01,
      -6713.18
    ],
    "label_coord": [
      7485.43,
      8762.88
    ],
    "marker": "https://render.guildwars2.com/file/9615D975B16C2CF46AF6B20E2541CED993EFA1EE/730409.png",
    "chat_link": "[&DE4AAADIAwAA]"
  },
  {
    "id": "968-88",
    "name": "Arid Fortress",
    "sector_id": 1157,
    "type": "Keep",
    "map_type": "EdgeOfTheMists",
    "map_id": 968,
    "coord": [
      6415.72,
      10635.7,
      -6814
    ],
    "label_coord": [
      6435.62,
      10653
    ],
    "marker": "https://render.guildwars2.com/file/9615D975B16C2CF46AF6B20E2541CED993EFA1EE/730409.png",
    "chat_link": "[&DFgAAADIAwAA]"
  },
  {
    "id": "968-89",
    "name": "Tytone Perch",
    "sector_id": 1172,
    "type": "Tower",
    "map_type": "EdgeOfTheMists",
    "map_id": 968,
    "coord": [
      8111.44,
      9658.89,
      -4842.11
    ],
    "label_coord": [
      8153.02,
      9771.67
    ],
    "marker": "https://render.guildwars2.com/file/D73DBE6D90140DC127F1DFBD90ACB77EE8701370/730416.png",
    "chat_link": "[&DFkAAADIAwAA]"
  },
  {
    "id": "968-79",
    "name": "Thunder Hollow",
    "sector_id": 1169,
    "type": "Keep",
    "map_type": "EdgeOfTheMists",
    "map_id": 968,
    "coord": [
      8610.49,
      10626.4,
      -6017
    ],
    "label_coord": [
      8643.92,
      10702.6
    ],
    "marker": "https://render.guildwars2.com/file/9615D975B16C2CF46AF6B20E2541CED993EFA1EE/730409.png",
    "chat_link": "[&DE8AAADIAwAA]"
  },
  {
    "id": "968-85",
    "name": "Tytone Perch Reactor",
    "sector_id": 1165,
    "type": "Resource",
    "map_type": "EdgeOfTheMists",
    "map_id": 968,
    "coord": [
      7783.19,
      9850.85,
      -5784.17
    ],
    "label_coord": [
      7808.26,
      9876.38
    ],
    "marker": "https://render.guildwars2.com/file/E89AAD28DA43D545D7E3681499049CB73C0E2FEE/102650.png",
    "chat_link": "[&DFUAAADIAwAA]"
  },
  {
    "id": "968-77",
    "name": "Inferno's Needle",
    "sector_id": 1171,
    "type": "Tower",
    "map_type": "EdgeOfTheMists",
    "map_id": 968,
    "coord": [
      7527.71,
      10619.2,
      -6189.76
    ],
    "label_coord": [
      7481.4,
      10755.7
    ],
    "marker": "https://render.guildwars2.com/file/D73DBE6D90140DC127F1DFBD90ACB77EE8701370/730416.png",
    "chat_link": "[&DE0AAADIAwAA]"
  },
  {
    "id": "968-87",
    "name": "Stonegaze Spire",
    "sector_id": 1170,
    "type": "Tower",
    "map_type": "EdgeOfTheMists",
    "map_id": 968,
    "coord": [
      6959.79,
      9665.44,
      -4828.02
    ],
    "label_coord": [
      6915.11,
      9570.07
    ],
    "marker": "https://render.guildwars2.com/file/D73DBE6D90140DC127F1DFBD90ACB77EE8701370/730416.png",
    "chat_link": "[&DFcAAADIAwAA]"
  },
  {
    "id": "968-84",
    "name": "Inferno's Needle Reactor",
    "sector_id": 1166,
    "type": "Resource",
    "map_type": "EdgeOfTheMists",
    "map_id": 968,
    "coord": [
      7527.04,
      10266.9,
      -5915.43
    ],
    "label_coord": [
      7600.42,
      10369.7
    ],
    "marker": "https://render.guildwars2.com/file/E89AAD28DA43D545D7E3681499049CB73C0E2FEE/102650.png",
    "chat_link": "[&DFQAAADIAwAA]"
  },
  {
    "id": "968-128",
    "name": "Frostreach Docks",
    "sector_id": 1507,
    "type": "Spawn",
    "map_type": "EdgeOfTheMists",
    "map_id": 968,
    "label_coord": [
      8462.49,
      11126.5
    ],
    "chat_link": "[&DIAAAADIAwAA]"
  },
  {
    "id": "968-129",
    "name": "Badlands Docks",
    "sector_id": 1492,
    "type": "Spawn",
    "map_type": "EdgeOfTheMists",
    "map_id": 968,
    "label_coord": [
      6445.02,
      11245.3
    ],
    "chat_link": "[&DIEAAADIAwAA]"
  },
  {
    "id": "968-92",
    "name": "Statuary",
    "sector_id": 1159,
    "type": "Generic",
    "map_type": "EdgeOfTheMists",
    "map_id": 968,
    "coord": [
      7557.21,
      9391.91,
      -4784.89
    ],
    "label_coord": [
      7511.39,
      9421.59
    ],
    "marker": "https://render.guildwars2.com/file/4C0113B6DF2E4E2CBB93244AD50DA49456D5014E/730412.png",
    "chat_link": "[&DFwAAADIAwAA]"
  }
].map((objective) => [objective.id, objective]));
