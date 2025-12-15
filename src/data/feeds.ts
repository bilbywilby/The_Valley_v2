import { FeedItem } from '@/types';

const UUID_NAMESPACE = 'a9a73802-517e-4f2a-a3a4-72bce5c10bce';

/**
 * Deterministic UUID v5 generator using a 32‑bit FNV‑1a hash.
 * The hash is expanded to 128‑bit (32 hex chars) by repetition,
 * then formatted as a UUID string with the version field set to 5.
 *
 * @param namespace - a UUID string that namespaces the name
 * @param name      - the name to hash (e.g. `${url}-${category}-${title}`)
 * @returns a UUID v5‑style string
 */
function uuidV5(namespace: string, name: string): string {
  const input = namespace + name;
  // 32‑bit FNV‑1a
  let hash = 0x811c9dc5 >>> 0;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    // multiply by FNV prime (mod 2^32)
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  // 8‑hex‑digit hash
  const hex8 = hash.toString(16).padStart(8, '0');
  // Expand to 32 hex chars for full UUID formatting
  const fullHex = (hex8 + hex8 + hex8 + hex8).slice(0, 32);
  // UUID format: 8‑4‑4‑4‑12, with version 5 in the third block
  return (
    `${fullHex.slice(0, 8)}-` +
    `${fullHex.slice(8, 12)}-` +
    `5${fullHex.slice(13, 15)}-` +
    `${fullHex.slice(16, 20)}-` +
    `${fullHex.slice(20, 32)}`
  );
}

const categorizedFeeds = {
  "News - Regional": [
    { title: "Lehigh Valley Live", url: "https://www.lehighvalleylive.com/arc/outboundfeeds/rss/?section=lehigh-valley" },
    { title: "The Morning Call (Local)", url: "http://www.mcall.com/arc/outboundfeeds/rss/" },
    { title: "WFMZ 69 News", url: "https://www.wfmz.com/search/?f=rss&t=article&l=20&c=news&s=start_time&sd=desc" },
    { title: "The Morning Call (Breaking)", url: "https://www.mcall.com/arc/outboundfeeds/rss/?outputType=xml&tag=breaking" },
    { title: "Express-Times (Easton)", url: "https://www.lehighvalleylive.com/arc/outboundfeeds/rss/?section=easton" },
  ],
  "News - Local": [
    { title: "Saucon Source", url: "https://sauconsource.com/feed/" },
    { title: "Patch Allentown", url: "https://patch.com/feeds/aol/pennsylvania/allentown" },
    { title: "Patch Bethlehem", url: "https://patch.com/feeds/aol/pennsylvania/bethlehem" },
    { title: "Patch Easton", url: "https://patch.com/feeds/aol/pennsylvania/easton" },
    { title: "Bethlehem Press", url: "https://www.bethlehempress.com/feed/" },
    { title: "Easton Express-Times (local feed)", url: "https://www.lehighvalleylive.com/arc/outboundfeeds/rss/?section=easton" },
    { title: "Slate Belt Press", url: "https://slatebeltpress.com/feed/" },
    { title: "Lehigh Valley Press", url: "https://lehighvalleypress.com/feed/" },
    { title: "Lehigh Valley Independent", url: "https://lehighvalleyindy.com/feed/" },
  ],
  "Gov - Municipal": [
    { title: "Upper Saucon Township", url: "https://www.uppersaucon.org/feed/" },
    { title: "Allentown City Government", url: "https://www.allentownpa.gov/Home/Feed" },
    { title: "Bethlehem City Government", url: "https://www.bethlehem-pa.gov/newsfeed.xml" },
    { title: "Easton City Government", url: "https://www.easton-pa.com/news/rss" },
    { title: "Allentown Parking Authority", url: "https://www.allentownparking.com/feed/" },
    { title: "County Election Offices", url: "https://www.lehighcounty.org/elections/feed/" },
    { title: "Catasauqua Borough News", url: "https://www.catasauqua.org/feed/" },
    { title: "Whitehall Township News", url: "https://www.whitehalltownship.com/feed/" },
    { title: "Coplay Borough Notices", url: "https://coplayborough.org/feed/" },
    { title: "Emmaus Borough News", url: "https://www.emmausborough.com/feed/" },
    { title: "Hellertown Borough News", url: "https://hellertownborough.org/feed/" },
    { title: "Fountain Hill Borough (notices)", url: "https://www.fountainhill.org/feed/" },
    { title: "Salisbury Township News", url: "https://www.salisburytownshippa.org/feed/" },
    { title: "Upper Macungie Township Updates", url: "https://www.uppermac.org/feed/" },
    { title: "Lower Macungie Township Notices", url: "https://www.lowermac.com/feed/" },
    { title: "Forks Township News", url: "https://www.forkstownship.org/feed/" },
    { title: "East Allen Township Updates", url: "https://www.eatwp.org/feed/" },
    { title: "Allen Township (Northampton) News", url: "https://www.allentownpa.gov/allen-township/feed/" },
    { title: "Lower Saucon Township News", url: "https://lowersaucontownship.org/feed/" },
    { title: "Allentown Restaurant Inspections", url: "https://www.allentownpa.gov/health/inspections/feed/" },
  ],
  "Gov - County": [
    { title: "Lehigh County Government", url: "https://www.lehighcounty.org/feed/" },
    { title: "Northampton County Government", url: "https://www.northamptoncounty.org/feed/" },
    { title: "Northampton County Recorder", url: "https://www.northamptoncounty.org/recorder/feed/" },
  ],
  "Safety - Police & Courts": [
    { title: "Lehigh CrimeWatch", url: "https://lehigh.crimewatchpa.com/rss.xml" },
    { title: "Palmer Twp PD", url: "https://northampton.crimewatchpa.com/rss.xml" },
    { title: "PA Courts (press releases)", url: "https://www.pacourts.us/pressroom/feed/" },
    { title: "Bethlehem Police Dept (press releases)", url: "https://www.bethlehem-pa.gov/police/press-releases/feed.xml" },
    { title: "Allentown Police Dept (press releases)", url: "https://www.allentownpa.gov/Police/PressReleasesFeed" },
    { title: "LV Office of Emergency Management", url: "https://www.lehighcounty.org/Departments/EmergencyServices/feed/" },
    { title: "Allentown Police Outreach", url: "https://www.allentownpa.gov/Police/CommunityOutreach/feed/" },
  ],
  "LV Business": [
    { title: "SCORE Lehigh Valley", url: "https://lehighvalley.score.org/rss.xml" },
    { title: "LVB Headlines (Lehigh Valley Business)", url: "https://lvb.com/feed/" },
    { title: "Lehigh Valley Chamber of Commerce", url: "https://www.lvchamber.org/feed/" },
    { title: "Lehigh Valley EDC", url: "https://www.lehighvalley.org/feed/" },
    { title: "Lehigh Valley SBDC", url: "https://www.lehighvalleysbdc.org/feed/" },
    { title: "LehighValley Startup News", url: "https://lvstartupnews.com/feed/" },
    { title: "Lehigh Valley Business Journal", url: "https://www.lvb.com/feed/" },
    { title: "Allentown Economic Development", url: "https://www.allentownpa.gov/ecodev/feed/" },
    { title: "Hispanic Business Alliance of LV", url: "https://hbalehighvalley.org/feed/" },
    { title: "Lehigh Valley Film Office", url: "https://lvfilmoffice.org/feed/" },
    { title: "Lehigh Valley Film Commission Locations", url: "https://www.film.lehighvalley.org/feed/" },
    { title: "Local Business Press Releases", url: "https://lvbusinessnews.org/feed/" },
    { title: "Lehigh Valley Minority Business Council", url: "https://lvmmbc.org/feed/" },
    { title: "LV Tech Hub", url: "https://lvtechhub.org/feed/" },
  ],
  "Education - Higher Ed": [
    { title: "Lafayette News (College)", url: "https://today.lafayette.edu/feed/" },
    { title: "Penn State Lehigh Valley (news)", url: "https://lehighvalley.psu.edu/rss.xml" },
    { title: "Moravian University News", url: "https://www.moravian.edu/news/feed" },
    { title: "Northampton Community College News", url: "https://www.northampton.edu/news/feed/" },
    { title: "The Brown and White (Lehigh U)", url: "https://www.thebrownandwhite.com/feed/" },
    { title: "Lafayette Student News", url: "https://lafayettestudentnews.com/feed/" },
    { title: "DeSales Student Radio", url: "https://www.desales.edu/student-radio/feed/" },
    { title: "Lehigh Valley Agricultural Extension", url: "https://extension.psu.edu/lehigh-valley/feed/" },
  ],
  "Education - K12": [
    { title: "Bethlehem Area School District", url: "https://www.bethlehemsd.org/feed.xml" },
    { title: "Allentown School District", url: "https://www.allentownsd.org/feed/" },
    { title: "Easton Area School District", url: "https://www.eastonsd.org/feed/" },
    { title: "Bethlehem Area SD Calendar", url: "https://www.bethlehemsd.org/calendar/feed/" },
    { title: "Allentown SD Newsroom", url: "https://www.allentownsd.org/news/feed/" },
  ],
  "Community & Civic": [
    { title: "CareerLink Lehigh Valley", url: "https://www.careerlinklehighvalley.org/feed/" },
    { title: "Saucon Source Jobs & Community", url: "https://sauconsource.com/feed/" },
    { title: "Lehigh Valley Transit Riders", url: "https://lvtransitriders.org/feed/" },
    { title: "Lehigh Valley Pride Alliance", url: "https://www.lvpride.org/feed/" },
    { title: "Local Churches & Faith Bulletin", url: "https://lvfaith.org/feed/" },
    { title: "Lehigh Valley Volunteer Opportunities", url: "https://volunteerlv.org/feed/" },
    { title: "Lehigh Valley Housing Authority", url: "https://www.lvhousing.org/feed/" },
    { title: "Lehigh Valley Tech & Startup Meetups", url: "https://www.meetup.com/topics/lehigh-valley-startups/rss/" },
    { title: "Lehigh Valley Public Library System", url: "https://lvpc.org/library/feed/" },
    { title: "Hispanic Center Lehigh Valley News", url: "https://hispaniccenter.org/feed/" },
    { title: "LANTA Board Meetings", url: "https://www.lantabus.com/about/board/feed/" },
    { title: "Lehigh Valley Pet Rescue & Shelter", url: "https://lvpetrescue.org/feed/" },
    { title: "Lehigh Valley Farmers Cooperative", url: "https://lvfarmercoop.org/feed/" },
    { title: "Lehigh Valley LGBTQ+ Center", url: "https://lvpridecenter.org/feed/" },
    { title: "Lehigh Valley Housing Initiatives", url: "https://lvhousinginitiatives.org/feed/" },
    { title: "Lehigh Valley Veterans Affairs", url: "https://lvvets.org/feed/" },
    { title: "Northampton Co Historical Society", url: "https://northamptonhistory.org/feed/" },
    { title: "Lehigh Valley Outdoor Adventure Club", url: "https://lvoutdooradventure.org/feed/" },
    { title: "Allentown Business Improvement District", url: "https://downtownallentown.com/feed/" },
    { title: "Lehigh Valley LGBTQ+ Youth Support", url: "https://lvyouthsupport.org/feed/" },
    { title: "Lehigh Valley Makerspace Job Board", url: "https://lvmakerspace.org/jobs/feed/" },
    { title: "Lehigh Valley Makers Directory", url: "https://lvmakersdirectory.org/feed/" },
    { title: "Lehigh Valley Homeless Services", url: "https://lvhomelessservices.org/feed/" },
    { title: "Lehigh Valley STEM Education Network", url: "https://lvstemnetwork.org/feed/" },
    { title: "Lehigh Valley Community Energy Co-op", url: "https://lvenergycoop.org/feed/" },
    { title: "Lehigh Valley CareerLink Events", url: "https://www.careerlinklehighvalley.org/events/feed/" },
    { title: "Northampton Co Housing Notices", url: "https://www.northamptoncounty.org/housing/feed/" },
    { title: "Easton Public Library Events", url: "https://www.eastonpl.org/rss/" },
    { title: "Lehigh County Library System", url: "https://www.lehighcounty.org/Departments/Library/feed/" },
    { title: "Easton Area Public Library News", url: "https://www.eastonpl.org/news/feed/" },
    { title: "Lehigh Valley Commons", url: "https://lehighvalleycommons.org/feed/" },
    { title: "LV Civic Engagement", url: "https://lehighvalleycivicengagement.org/feed/" },
  ],
  "Media / Culture": [
    { title: "Lehigh Valley Community Radio (WVRS)", url: "https://wvrs.org/feed/" },
    { title: "WDIY Community Radio", url: "https://www.wdiy.org/feed/" },
    { title: "B104 Radio", url: "https://b104radio.com/feed/" },
    { title: "100.7 LEV Radio", url: "https://www.100-7lev.com/feed/" },
    { title: "Real Oldies 1470", url: "https://realoldies1470.com/feed/" },
    { title: "Lehigh Valley Public Media", url: "https://www.lehighvalleypublicmedia.org/feed/" },
    { title: "LV Cultural Media", url: "https://lvculturalmedia.org/feed/" },
  ],
  "Lifestyle - Arts & Events": [
    { title: "ArtsQuest Events", url: "https://www.artsquest.org/events/feed/" },
    { title: "Musikfest", url: "https://www.musikfest.org/feed/" },
    { title: "Allentown Art Museum", url: "https://www.allentownartmuseum.org/feed/" },
    { title: "Miller Symphony Hall", url: "https://www.millersymphonyhall.org/feed/" },
    { title: "State Theatre", url: "https://statetheatre.org/feed/" },
    { title: "Lehigh Valley Entertainment", url: "https://www.lehighvalleylive.com/arc/outboundfeeds/rss/?section=entertainment" },
    { title: "Allentown ArtScene", url: "https://allentownartscene.com/feed/" },
    { title: "Lehigh Valley Arts Council", url: "https://lvartscouncil.org/feed/" },
    { title: "Lehigh Valley Arts & Culture Calendar", url: "https://lvcalendar.org/feed/" },
    { title: "Lehigh Valley Film Society", url: "https://lvfilmsociety.org/feed/" },
    { title: "SouthSide Arts District (Allentown)", url: "https://southsideartsdistrict.com/feed/" },
    { title: "Lehigh Valley Arts Academy", url: "https://lvartsacademy.org/feed/" },
    { title: "Lehigh Valley Film Festival", url: "https://lvfilmfestival.org/feed/" },
    { title: "Bethlehem SteelStacks Programming", url: "https://www.steelstacks.org/feed/" },
    { title: "Bethlehem Art Walk", url: "https://bethlehemartwalk.org/feed/" },
    { title: "Lehigh Valley Public Art Grants", url: "https://lvpublicartgrants.org/feed/" },
    { title: "Bethlehem Arts Weekend", url: "https://bethlehemartsweekend.org/feed/" },
    { title: "Allentown Youth Orchestra", url: "https://allyouthorchestra.org/feed/" },
    { title: "Bethworks (Casino/Events)", url: "https://www.bethworks.com/feed/" },
    { title: "Lehigh Valley Style", url: "https://lehighvalleystyle.com/feed/" },
    { title: "Lehigh Valley Film (LVFilm.org)", url: "https://lehighvalleyfilm.org/feed/" },
  ],
  "Lifestyle - Food & Drink": [
    { title: "Discover Lehigh Valley", url: "https://www.discoverlehighvalley.com/rss" },
    { title: "Weyerbacher Brewing", url: "https://weyerbacher.com/feed/" },
    { title: "Lehigh Valley Farmer's Markets", url: "https://www.lvfm.org/feed/" },
    { title: "Lehigh Valley Restaurant Week", url: "https://www.lehighvalleyrestaurantweek.com/feed/" },
    { title: "Bethlehem Farmers' Market", url: "https://bethlehemfarmersmarket.org/feed/" },
    { title: "Allentown Public Market", url: "https://www.allentownpublicmarket.com/feed/" },
    { title: "Easton Farmers Market", url: "https://eastonfarmersmarket.com/feed/" },
    { title: "Pork Illustrated", url: "https://www.porkillustrated.com/feed/" },
  ],
  "Lifestyle - Environment": [
    { title: "Wildlands Conservancy", url: "https://www.wildlandspa.org/feed/" },
    { title: "D&L Corridor", url: "https://delawareandlehigh.org/feed/" },
    { title: "Jacobsburg Environmental Center", url: "https://www.dcnr.pa.gov/StateParks/FindAPark/JacobsburgEECenter/Feed/" },
    { title: "Lehigh Valley Clean Energy Coalition", url: "https://lvcleanenergy.org/feed/" },
  ],
  "Lifestyle - Outdoors": [
    { title: "Lehigh County Parks & Recreation", url: "https://www.lehighcounty.org/Departments/Parks/feed/" },
    { title: "Northampton County Parks & Recreation", url: "https://www.northamptoncounty.org/parks/feed/" },
  ],
  "Sports": [
    { title: "Lehigh Athletics", url: "https://lehighsports.com/rss" },
    { title: "Lafayette Athletics", url: "https://goleopards.com/rss.aspx?path=" },
    { title: "LV Phantoms", url: "https://www.phantomshockey.com/feed/" },
    { title: "HS Sports (LehighValleyLive High School)", url: "https://www.lehighvalleylive.com/arc/outboundfeeds/rss/?section=high-school-sports" },
    { title: "Lehigh Valley Marathon & Races", url: "https://lvmarathon.org/feed/" },
    { title: "Local School Sports Boosters", url: "https://lvboosters.org/feed/" },
    { title: "Lehigh Valley Youth Sports League", url: "https://lvyouthsports.org/feed/" },
  ],
  "Transit & Weather": [
    { title: "ABE Airport (Lehigh Valley Int'l)", url: "https://www.flyabe.com/feed/" },
    { title: "LANTA Bus", url: "https://www.lantabus.com/feed/" },
    { title: "Lehigh Valley International Airport Alerts", url: "https://www.flyabe.com/rss/alerts.xml" },
    { title: "LANTA Service Alerts", url: "https://www.lantabus.com/rss/alerts.xml" },
    { title: "Lehigh Valley Transportation Study", url: "https://www.lvpc.org/transportation/feed/" },
    { title: "PA Dept. of Transportation (local alerts)", url: "https://www.penndot.gov/RSS/LocalAlerts" },
    { title: "NWS Allentown Weather Alerts", url: "https://alerts.weather.gov/cap/wwaatmget.php?x=PAZ062" },
    { title: "Regional Weather Radar & Alerts", url: "https://lvweatherradar.org/feed/" },
    { title: "Regional Rail & Commuter Alerts", url: "https://regionalrailalerts.org/lv/feed/" },
    { title: "Lehigh Valley Regional Planning Commission", url: "https://www.lvpc.org/feed/" },
  ],
  "Health": [
    { title: "Lehigh Valley Health Network (press releases)", url: "https://lvhn.org/rss/feed.xml" },
    { title: "St. Luke's University Health Network (news)", url: "https://www.slhn.org/rss" },
    { title: "Good Shepherd Rehab & Nursing (news)", url: "https://www.goodshepherdrehab.org/feed/" },
    { title: "Community Health Alerts", url: "https://lvpublichealthalerts.org/feed/" },
    { title: "Northampton County Health Dept", url: "https://www.northamptoncounty.org/health/feed/" },
  ],
  "Utilities / Infrastructure": [
    { title: "Regional Energy & Utilities Updates", url: "https://lvutilitiesnews.org/feed/" },
    { title: "Lehigh County Solid Waste", url: "https://www.lehighcounty.org/Departments/SolidWaste/feed/" },
  ],
};

const allFeedsWithPotentialDuplicates = Object.entries(categorizedFeeds)
  .flatMap(([category, feeds]) =>
    feeds.map(feed => ({
      ...feed,
      // CRITICAL FIX: Generate a more unique ID to prevent key collisions
      id: uuidV5(UUID_NAMESPACE, `${feed.url}-${category}-${feed.title}`),
      category,
    }))
  );

// Deduplicate feeds based on the newly generated unique ID
const uniqueFeedsMap = new Map<string, FeedItem>();
allFeedsWithPotentialDuplicates.forEach(feed => {
  if (!uniqueFeedsMap.has(feed.id)) {
    uniqueFeedsMap.set(feed.id, feed);
  }
});

export const ALL_FEEDS: FeedItem[] = Array.from(uniqueFeedsMap.values());
export const CATEGORIES = Object.keys(categorizedFeeds);
//