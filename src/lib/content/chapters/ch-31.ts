import type { Chapter } from '../types';

export const ch31: Chapter = {
  id: 'ch-31',
  number: 31,
  partId: 'part-10',
  title: 'Head Trauma',
  cards: [
    {
      id: 'ch-31.fc.01',
      q: 'What is the difference between open and closed brain injury?',
      a: 'Closed: skull intact, brain injured by coup/contrecoup or shearing. Open: skull fractured with brain tissue exposed — high infection risk.'
    },
    {
      id: 'ch-31.fc.02',
      q: 'What is diffuse axonal injury (DAI)?',
      a: 'Widespread shearing of axons from rapid acceleration/deceleration — severe TBI with poor prognosis, often prolonged unconsciousness.'
    },
    {
      id: 'ch-31.fc.03',
      q: 'How do concussion, contusion, and brain laceration differ?',
      a: 'Concussion: temporary dysfunction, no structural damage. Contusion: bruising of brain tissue. Laceration: actual tearing of brain tissue — more severe.'
    },
    {
      id: 'ch-31.fc.04',
      q: 'What is the difference between epidural and subdural hematoma?',
      a: 'Epidural: arterial bleeding between skull and dura — lucid interval then rapid decline. Subdural: venous bleeding between dura and brain — slower onset.'
    },
    {
      id: 'ch-31.fc.05',
      q: 'What is brain herniiation and what are its signs?',
      a: 'Brain tissue forced through skull openings from rising ICP — Cushing\'s triad (HTN, bradycardia, irregular respirations), blown pupil, posturing.'
    },
    {
      id: 'ch-31.fc.06',
      q: 'What is the assessment-based approach to brain injuries?',
      a: 'MOI → primary survey (airway priority) → GCS and neuro exam → field impression → prevent secondary injury (hypoxia, hypotension), elevate head 15-30°, rapid transport.'
    },
    {
      id: 'ch-31.fc.07',
      q: 'What causes secondary brain injury?',
      a: 'Hypoxia and hypotension after the initial trauma — worsens outcomes. Aggressive airway management and BP support are critical.'
    },
    {
      id: 'ch-31.fc.08',
      q: 'What is the Glasgow Coma Scale used for?',
      a: 'Eye (1-4) + Verbal (1-5) + Motor (1-6) = 3-15. Score ≤8 indicates severe TBI requiring aggressive airway management.'
    }
  ],
  notes: [
    {
      id: 'ch-31.n.01',
      title: 'Types of Brain Injury (Obj 31-7)',
      body: 'Closed injury: skull intact — concussion (temporary dysfunction), contusion (brain bruise), DAI (axonal shearing), intracerebral hematoma. Open injury: skull breached with exposed brain. Epidural hematoma: arterial, classic lucid interval then rapid deterioration. Subdural hematoma: venous, slower onset, common in elderly. Brain laceration: tearing of brain tissue. Herniation: rising ICP forces brain through openings — Cushing\'s triad, unequal pupils, posturing.',
      terms: [
        'Closed brain injury',
        'Open brain injury',
        'DAI',
        'Epidural hematoma',
        'Subdural hematoma',
        'Herniation',
        'Cushing\'s triad'
      ]
    },
    {
      id: 'ch-31.n.02',
      title: 'Assessment-Based Approach (Obj 31-8)',
      body: 'Assess MOI and index of suspicion. Primary survey: airway is priority — GCS ≤8 cannot protect airway. Perform GCS, pupil exam, and motor/sensory assessment. Form field impression (mild/moderate/severe TBI). Prehospital care: high-flow O2, prevent hypoxia and hypotension (secondary brain injury), elevate head 15-30° if no spinal concern, spine motion restriction as indicated, rapid transport to trauma center.',
      terms: [
        'GCS',
        'Field impression',
        'Secondary brain injury',
        'Airway priority',
        'Head elevation',
        'Pupil assessment'
      ]
    },
    {
      id: 'ch-31.n.03',
      title: 'TBI Management Priorities',
      body: 'Maintain airway and adequate oxygenation — hypoxia kills brain cells. Support blood pressure — hypotension worsens cerebral perfusion. Avoid hyperventilation except for signs of impending herniation. Monitor GCS and pupils continuously. Transport to a facility with neurosurgical capability. Do not give anything by mouth.',
      terms: [
        'Hypoxia',
        'Hypotension',
        'Hyperventilation',
        'Neurosurgical',
        'Posturing',
        'Lucid interval'
      ]
    }
  ],
  quiz: [
    {
      id: 'ch-31.q.01',
      q: 'Epidural hematoma classically presents with:',
      opts: [
        'A. Gradual confusion over days',
        'B. Initial LOC, lucid interval, then rapid deterioration',
        'C. Immediate coma without recovery',
        'D. Bilateral pupil dilation from onset'
      ],
      ans: 1,
      exp: 'Epidural hematoma (arterial bleeding) may cause initial LOC, a lucid interval, then rapid deterioration as blood accumulates.'
    },
    {
      id: 'ch-31.q.02',
      q: 'Diffuse axonal injury (DAI) is caused by:',
      opts: [
        'A. Direct penetrating trauma only',
        'B. Rapid acceleration/deceleration shearing brain axons',
        'C. Infection of brain tissue',
        'D. Hypoxia alone'
      ],
      ans: 1,
      exp: 'DAI results from shearing forces during rapid acceleration/deceleration — widespread axonal damage with poor prognosis.'
    },
    {
      id: 'ch-31.q.03',
      q: 'Cushing\'s Triad indicates:',
      opts: [
        'A. Hypovolemic shock',
        'B. Severely increased intracranial pressure with impending herniation',
        'C. Normal neurological status',
        'D. Spinal cord injury only'
      ],
      ans: 1,
      exp: 'Cushing\'s Triad (hypertension, bradycardia, irregular respirations) is a late sign of critically elevated ICP.'
    },
    {
      id: 'ch-31.q.04',
      q: 'A concussion is best described as:',
      opts: [
        'A. Permanent structural brain damage',
        'B. Temporary neurological dysfunction without structural damage on imaging',
        'C. Open skull fracture',
        'D. Arterial bleeding between skull and dura'
      ],
      ans: 1,
      exp: 'Concussion causes temporary neurological dysfunction — no visible structural damage on CT, though symptoms can be significant.'
    },
    {
      id: 'ch-31.q.05',
      q: 'Secondary brain injury is caused by:',
      opts: [
        'A. The initial impact only',
        'B. Hypoxia and hypotension following the injury',
        'C. Cervical spine damage',
        'D. Seizure activity only'
      ],
      ans: 1,
      exp: 'Secondary brain injury from inadequate oxygenation and perfusion after the initial trauma significantly worsens outcomes.'
    },
    {
      id: 'ch-31.q.06',
      q: 'A GCS score of 7 indicates:',
      opts: [
        'A. Mild TBI',
        'B. Moderate TBI',
        'C. Severe TBI requiring aggressive airway management',
        'D. Normal neurological function'
      ],
      ans: 2,
      exp: 'GCS ≤8 = severe TBI — patient cannot protect their airway and needs aggressive airway management.'
    },
    {
      id: 'ch-31.q.07',
      q: 'Subdural hematoma is most common in:',
      opts: [
        'A. Young athletes only',
        'B. Elderly patients and chronic alcoholics',
        'C. Infants under 6 months only',
        'D. Penetrating trauma only'
      ],
      ans: 1,
      exp: 'Subdural hematoma results from venous bleeding and develops more slowly — elderly with brain atrophy are at highest risk.'
    },
    {
      id: 'ch-31.q.08',
      q: 'In the assessment-based approach to head trauma, the first priority is:',
      opts: [
        'A. Applying a cervical collar',
        'B. Airway and breathing management',
        'C. Transport before any assessment',
        'D. Checking blood glucose'
      ],
      ans: 1,
      exp: 'Airway management is the top priority — hypoxia causes secondary brain injury. Assess and secure the airway before other interventions.'
    }
  ]
};
