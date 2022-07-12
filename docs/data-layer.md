# Green-up App Data Layer

All Data is stored in Firebase.

## Collections

- **Trash Drop** (`/trashDrops`) - a location some person or team has filled a trash bag and left it by the side of the road... OR left a filled trash bag at a Trash Collection Site
- **Trash Collection Site** (`/trashCollectionSites`) - a location in each town that one can bring trash to, in Green Up bags, for free on GUD. Usually a standard dump or transfer station. But sometimes it is a town garage or a trash truck parked in the town square. Trash Collection sites are used mostly in towns that do not organize road-side pickup of trash bags (trash drops) left by greener-uppers.
- **Supply Distribution Sites** (`/supplyDistributionSites`) - where to go in your town to get the free Green Up Trash Bags.
- **Team Location** (`/teams/<id>/location`) - where a team is generally located... also often the team's meeting place when they first gather
- **Team Locations** (`/teams/<id>/locations`) - a series of pins on the map that outline where a team is going to be working... often a series of pins along a road or trail.
