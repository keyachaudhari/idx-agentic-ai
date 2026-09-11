# Schema Annotations

This document records the main database fields used throughout the IDX Multi-Agent Real Estate Assistant.

The project uses two MySQL tables:

- `rets_property` for active property listings
- `california_sold` for historical sold-property data

---

## rets_property

### L_ListingID

**Meaning:** MLS listing identifier.

**Used for:**
- identifying a specific listing
- recommendation lookups
- connecting listing records across project components

---

### L_Address

**Meaning:** Property street address.

**Used for:**
- displaying property search results
- recommendation output
- WhatsApp formatting
- email listing alerts

---

### L_City

**Meaning:** City where the listing is located.

**Used for:**
- filtering property searches
- comparing listings by location
- recommendation scoring
- displaying results

---

### L_SystemPrice

**Meaning:** Current listing price.

**Used for:**
- price filtering
- structured recommendation similarity
- property result display
- comparison against sold comps

---

### L_Keyword2

**Meaning:** Number of bedrooms.

**Used for:**
- bedroom search filters
- recommendation similarity scoring
- property result formatting

---

### LM_Dec_3

**Meaning:** Number of bathrooms.

**Used for:**
- property search criteria
- property result display

---

### LM_Int2_3

**Meaning:** Approximate finished square footage.

**Used for:**
- property search
- recommendation similarity scoring
- sold-comp validation
- property display

---

### L_Status

**Meaning:** Current listing status.

Examples include:
- Active
- Pending
- Withdrawn

**Used for:**
- limiting property searches to active listings
- filtering recommendation candidates

---

### L_Remarks

**Meaning:** Full property description written by the listing agent.

**Used for:**
- semantic search
- embeddings
- similarity matching
- recommendation features

This is one of the most important fields for the semantic-search portion of the project.

---

### L_Type_

**Meaning:** Property subtype.

Examples:
- SingleFamilyResidence
- Condominium

**Used for:**
- property characteristics
- recommendation embedding text
- similarity comparison

---

### YearBuilt

**Meaning:** Year the property was constructed.

**Used for:**
- property context
- recommendation data

---

### AssociationFee

**Meaning:** HOA or association fee.

**Used for:**
- property field reference
- RAG knowledge questions

---

### PoolPrivateYN

**Meaning:** Indicates whether the property has a private pool.

**Used for:**
- property result formatting
- WhatsApp output

---

## california_sold

### ListingKey

**Meaning:** Unique identifier for the sold property record.

**Used for:**
- identifying sold records
- possible linking with active MLS listing identifiers

---

### City

**Meaning:** City where the sold property is located.

**Used for:**
- market statistics by city
- sold comparable searches
- price trend analysis

---

### ClosePrice

**Meaning:** Final sale price of the property.

**Used for:**
- average sale price
- market trends
- price-per-square-foot calculations
- comparable sales
- recommendation validation

---

### CloseDate

**Meaning:** Date the property sale officially closed.

**Used for:**
- limiting analysis to recent sales
- monthly trend analysis
- six-month comparable searches
- twelve-month market reports

---

### ListPrice

**Meaning:** Listing price before the property sold.

**Used for:**
- list-to-close ratio calculations
- market competitiveness analysis

---

### OriginalListPrice

**Meaning:** Original asking price when the property was first listed.

**Used for:**
- sold-property context
- historical pricing analysis

---

### LivingArea

**Meaning:** Interior living area in square feet.

**Used for:**
- price-per-square-foot calculations
- selecting comparable properties
- estimated comp pricing

---

### DaysOnMarket

**Meaning:** Number of days the property remained on the market.

**Used for:**
- average DOM calculations
- market-speed analysis
- market reports

---

### PropertyType

**Meaning:** General property category.

Example:
- Residential

**Used for:**
- restricting market analytics and comparable searches to relevant properties

---

### BedroomsTotal

**Meaning:** Total number of bedrooms.

**Used for:**
- sold-property reference
- RAG schema knowledge

---

### BathroomsTotalInteger

**Meaning:** Total number of bathrooms.

**Used for:**
- sold-property reference
- RAG schema knowledge

---

### StandardStatus

**Meaning:** Standardized MLS status.

**Used for:**
- schema reference
- RAG knowledge assistant

---

## How the Two Tables Are Used Together

The recommendation engine uses both datasets.

```text
rets_property
     |
     | active listing information
     v
Recommendation Engine
     ^
     | recent sold comparables
     |
california_sold