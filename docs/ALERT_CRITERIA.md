# Alert & Escalation Criteria

## Overview

The Greenhouse Monitoring System uses a two-tier alert system to manage plant health issues efficiently:
- **👤 Human Check** - Issues requiring attention within a work shift (8 hours)
- **📟 Pager Alert** - Critical emergencies requiring immediate action (<2 hours)

This document explains when each alert type is triggered and the reasoning behind these decisions.

---

## 🎯 Alert Hierarchy

### Priority Levels

| Priority | Alert Type | Response Time | Risk Level | Examples |
|----------|-----------|---------------|------------|----------|
| **Critical** | 📟 Pager Alert | <2 hours | Crop damage imminent | Heat spike, conflicting signals |
| **Urgent** | 👤 Human Check | <8 hours | Monitoring needed | Low confidence, missing sensor |
| **Routine** | Log only | <24 hours | Preventive | Minor variations, maintenance |

---

## 👤 Human Check Criteria

Human Check alerts are triggered when the system detects issues that require human attention but are not immediately critical.

### Trigger Conditions

A **Human Check** badge appears when **ANY** of these conditions are met:

1. **Low AI Confidence** (confidence < 60%)
   - AI is uncertain about the analysis
   - Not enough data for reliable conclusion
   - Recommendation needed from experienced operator

2. **Uncertain Status** (status = "uncertain")
   - System cannot make a definitive assessment
   - Multiple factors creating ambiguity
   - Requires expert judgment

3. **Conflicting Signals** (signals_agree = false)
   - Sensor data contradicts visual assessment
   - Unexpected discrepancy between data sources
   - May indicate sensor malfunction or hidden issue

4. **Image Quality Issues**
   - Blurry image (edge detection < 6)
   - Dark image (brightness < 25)
   - Cannot perform reliable visual assessment

5. **Missing Sensor Data**
   - One or more critical sensors offline
   - Temperature, humidity, CO₂, or soil moisture unavailable
   - System working on incomplete information

### Real-World Examples

#### Example 1: Blurry Image (11:00 AM)
```
Confidence: 20%
Status: uncertain
Reasoning: "Image quality issue: Image appears blurry/low-detail for reliable assessment"
Action: Technician cleans camera lens or repositions camera
Timeline: Fix within current shift
```

#### Example 2: Missing Temperature Sensor (11:15 AM)
```
Confidence: 10%
Status: uncertain
Reasoning: "Missing temperature sensor data - cannot perform reliable analysis"
Action: Technician replaces sensor or checks wiring
Timeline: Fix within 2-4 hours (non-critical)
```

### Why Not Pager?

Human Check issues are **maintenance or data quality problems**, not plant emergencies:
- Plants are not in immediate danger
- Can wait for technician's next round
- Fixing the issue prevents future problems
- No crop damage will occur in next 4-8 hours

---

## 📟 Pager Alert Criteria

Pager Alerts are reserved for **critical situations** where immediate human intervention is required to prevent crop damage.

### Trigger Conditions

A **Pager Alert** is sent when **ANY** of these critical conditions occur:

1. **Critical Temperature Detected**
   - Temperature ≥ 38°C (heat stress begins)
   - Temperature ≥ 40°C (severe heat stress, urgent)
   - Temperature ≤ 10°C (cold damage risk)
   - **Risk:** Crop damage in 2-4 hours

2. **Severe Environmental Conditions**
   - Humidity > 90% (mold/fungus risk)
   - Soil moisture < 15% (severe drought)
   - CO₂ < 300 ppm (photosynthesis impaired)
   - **Risk:** Irreversible damage within hours

3. **Conflicting Signals with Low Confidence** (confidence < 50%)
   - Sensors say "OK" but image shows stress
   - Unknown threat requiring expert diagnosis
   - AI cannot explain the discrepancy
   - **Risk:** Hidden disease, pest, or equipment failure

4. **Visual Damage with Abnormal Sensors**
   - Plant shows stress + sensors confirm abnormal conditions
   - Multiple indicators pointing to same problem
   - Confidence in problem but uncertainty in severity
   - **Risk:** Condition may be spreading or worsening

### Real-World Examples

#### Example 1: Heat Stress (11:30 AM)
```
Temperature: 38°C
Confidence: 50-70%
Status: uncertain/potential_anomaly
Visual: "Leaves show browning and curling, indicating potential stress"

Pager Alert:
- SMS: "+31-6-1234-5678"
- Call: "Head Greenhouse Operator"
- Reason: "Critical temperature detected (38°C) - immediate cooling required"

Why Pager?
- Tomatoes begin wilting at 35°C
- Permanent damage occurs at 38°C+ in 2-4 hours
- Requires IMMEDIATE action: open vents, activate cooling, increase irrigation

Timeline: <1 hour response required
```

#### Example 2: Severe Heat Stress (11:45 AM)
```
Temperature: 40°C
Confidence: 50-65%
Status: uncertain
Visual: "Healthy fruit with some leaf browning"

Pager Alert:
- Reason: "SEVERE temperature detected (40°C) - URGENT cooling action required"

Why Pager?
- 40°C = crop loss imminent
- Fruit quality degradation begins immediately
- Leaves will crisp and die within 1-2 hours
- Financial loss escalates rapidly

Timeline: <30 minutes response critical
```

#### Example 3: Conflicting Signals (12:00 PM)
```
Temperature: 24°C (normal)
Sensors: All normal
Visual: "Yellowing leaves, suggesting nutrient or water issues"
Confidence: 45%
signals_agree: false

Pager Alert:
- Reason: "Low confidence analysis - requires human inspection"

Why Pager?
- Sensors might be lying (calibration drift)
- Could be disease spreading
- Could be pest infestation
- Unknown threat requires expert eyes
- Early detection prevents spread to entire greenhouse

Timeline: <2 hours for diagnosis
```

### Why Pager and Not Just Human Check?

Critical conditions require **immediate action** because:
- **Time sensitivity:** Damage occurs in hours, not days
- **Financial impact:** Crop loss is expensive
- **Escalation risk:** Problems can spread rapidly
- **Operator expertise needed:** Requires experienced decision-making
- **After-hours coverage:** May occur outside normal work hours

---

## 📊 Decision Matrix

### Quick Reference Guide

| Situation | Confidence | Status | Alert Type | Response Time |
|-----------|-----------|--------|------------|---------------|
| Blurry image | 20% | uncertain | 👤 Human Check | 4-8 hours |
| Missing sensor | 10% | uncertain | 👤 Human Check | 2-4 hours |
| Temp 38°C + visual damage | 50-70% | uncertain | 📟 **Pager Alert** | <1 hour |
| Temp 40°C | 50-65% | uncertain | 📟 **Pager Alert** | <30 min |
| Normal sensors + yellow leaves | 45% | uncertain | 📟 **Pager Alert** | <2 hours |
| All normal | 90% | normal | ✅ No alert | - |