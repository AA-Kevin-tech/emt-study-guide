import type { Chapter } from '../types';

export const ch32: Chapter = {
  id: 'ch-32',
  number: 32,
  partId: 'part-10',
  title: 'Spinal Trauma & Spine Motion Restriction',
  cards: [
    {
      id: 'ch-32.fc.01',
      q: 'What mechanisms commonly cause spinal column or cord injury?',
      a: 'Flexion, extension, rotation, compression, and distraction forces — MVC, falls, diving accidents, blunt trauma to head/neck/back, and penetrating trauma.'
    },
    {
      id: 'ch-32.fc.02',
      q: 'How do you assess pulse, motor, and sensory function in suspected spinal injury?',
      a: 'Check peripheral pulses, test motor function in all extremities (grip, foot push/pull), and assess sensation to light touch in all dermatomes — compare sides.'
    },
    {
      id: 'ch-32.fc.03',
      q: 'What is the difference between spine motion restriction (SMR) and spinal immobilization?',
      a: 'SMR: selective use of devices to limit spinal movement based on clinical criteria. Old approach: universal immobilization of all trauma patients on long backboards.'
    },
    {
      id: 'ch-32.fc.04',
      q: 'When is spine motion restriction indicated?',
      a: 'High-risk MOI, altered LOC, midline spinal tenderness, neurological deficits, or distracting injuries making reliable exam impossible.'
    },
    {
      id: 'ch-32.fc.05',
      q: 'What is the role of a cervical collar in SMR?',
      a: 'Restricts cervical motion as an adjunct — does not eliminate movement. Applied after manual inline stabilization (MILS); must be sized correctly.'
    },
    {
      id: 'ch-32.fc.06',
      q: 'What are full-body and short spine SMR devices?',
      a: 'Full-body: long backboard or scoop stretcher for supine patients. Short spine: KED or similar for seated patients during vehicle extrication.'
    },
    {
      id: 'ch-32.fc.07',
      q: 'What is MILS and when is it used?',
      a: 'Manual Inline Stabilization — hands hold head in neutral alignment from first contact until patient is secured to SMR device.'
    },
    {
      id: 'ch-32.fc.08',
      q: 'What abnormal neuro findings suggest spinal cord injury?',
      a: 'Weakness/paralysis, numbness/tingling, loss of sensation, priapism, neurogenic shock (warm dry skin, hypotension, bradycardia).'
    }
  ],
  notes: [
    {
      id: 'ch-32.n.01',
      title: 'Mechanisms of Spinal Injury (Obj 32-3)',
      body: 'Spinal injury results from forces exceeding column tolerance: flexion (forward bending — anterior compression), extension (backward — posterior elements), rotation (twisting — ligament/t disc injury), compression (axial load — burst fractures), and distraction (pulling apart — ligament rupture). Common mechanisms: MVC, falls from height, diving into shallow water, direct blows, and penetrating trauma. Cervical spine is most vulnerable.',
      terms: [
        'Flexion',
        'Extension',
        'Rotation',
        'Compression',
        'Distraction',
        'Cervical spine'
      ]
    },
    {
      id: 'ch-32.n.02',
      title: 'Neuro Assessment & SMR vs Immobilization (Obj 32-7, 32-8)',
      body: 'Assess pulse (peripheral perfusion), motor function (grip strength, foot dorsi/plantar flexion), and sensory function (light touch in all extremities) — document normal vs abnormal. SMR replaces universal backboarding: immobilize selectively based on clinical criteria, not all trauma patients. MILS from first contact. C-collar is an adjunct, not a standalone solution.',
      terms: [
        'Motor function',
        'Sensory function',
        'SMR',
        'MILS',
        'Selective immobilization',
        'Midline tenderness'
      ]
    },
    {
      id: 'ch-32.n.03',
      title: 'SMR Devices & Application (Obj 32-11)',
      body: 'Cervical collar: sized and applied under MILS — restricts but does not eliminate cervical motion. Full-body device (long backboard/scoop): for supine patients — secure head, torso, pelvis, and extremities. Short spine device (KED): for seated patients during extrication. Supplemental equipment: head blocks, straps, tape. Log-roll with adequate personnel when moving patients onto devices.',
      terms: [
        'C-collar',
        'Long backboard',
        'Scoop stretcher',
        'KED',
        'Head blocks',
        'Log-roll'
      ]
    }
  ],
  quiz: [
    {
      id: 'ch-32.q.01',
      q: 'A diving accident into shallow water is a common mechanism for:',
      opts: [
        'A. Abdominal trauma only',
        'B. Cervical spine injury from flexion force',
        'C. Lower extremity fracture only',
        'D. Cardiac arrest only'
      ],
      ans: 1,
      exp: 'Diving into shallow water applies severe flexion force to the cervical spine — always suspect c-spine injury.'
    },
    {
      id: 'ch-32.q.02',
      q: 'When assessing a patient with suspected spinal injury, you should test:',
      opts: [
        'A. Blood pressure only',
        'B. Pulse, motor function, and sensory function in all extremities',
        'C. Pupil response only',
        'D. Abdominal tenderness only'
      ],
      ans: 1,
      exp: 'Complete neuro assessment includes peripheral pulses, motor strength in all extremities, and sensory function — compare both sides.'
    },
    {
      id: 'ch-32.q.03',
      q: 'Spine motion restriction (SMR) differs from the historical approach because:',
      opts: [
        'A. All patients are still backboarded automatically',
        'B. SMR uses selective criteria rather than universal immobilization',
        'C. SMR eliminates the need for any cervical collar',
        'D. SMR is only for medical patients'
      ],
      ans: 1,
      exp: 'Current guidelines use selective SMR based on clinical criteria — not automatic backboarding of every trauma patient.'
    },
    {
      id: 'ch-32.q.04',
      q: 'MILS should be maintained:',
      opts: [
        'A. Only until the C-collar is applied',
        'B. From first contact until the patient is fully secured to the SMR device',
        'C. Only during transport',
        'D. Only if neurological deficits are present'
      ],
      ans: 1,
      exp: 'Manual inline stabilization must be maintained from initial contact until the patient is fully secured with head immobilization.'
    },
    {
      id: 'ch-32.q.05',
      q: 'The KED (short spine device) is used for:',
      opts: [
        'A. All supine trauma patients',
        'B. Seated patients with suspected spinal injury during vehicle extrication',
        'C. Pediatric patients only',
        'D. Patients with isolated lower extremity injuries'
      ],
      ans: 1,
      exp: 'The KED immobilizes seated patients before extrication from vehicles — a short spine motion restriction device.'
    },
    {
      id: 'ch-32.q.06',
      q: 'Priapism in a trauma patient suggests:',
      opts: [
        'A. Genitourinary injury',
        'B. Spinal cord injury with autonomic disruption',
        'C. Normal physiological response',
        'D. Hypovolemic shock'
      ],
      ans: 1,
      exp: 'Priapism indicates loss of autonomic nervous system control from spinal cord injury — an important neuro finding.'
    },
    {
      id: 'ch-32.q.07',
      q: 'Indications for spine motion restriction include:',
      opts: [
        'A. All patients involved in any MVC',
        'B. High-risk MOI, altered LOC, midline tenderness, or neurological deficits',
        'C. Only patients with visible spinal deformity',
        'D. Patients who request immobilization'
      ],
      ans: 1,
      exp: 'SMR is indicated for high-risk mechanism, altered mental status, midline spinal tenderness, neuro deficits, or unreliable exam due to distracting injuries.'
    },
    {
      id: 'ch-32.q.08',
      q: 'A cervical collar alone:',
      opts: [
        'A. Completely eliminates all cervical spine movement',
        'B. Restricts but does not eliminate cervical motion — is an adjunct to MILS',
        'C. Replaces the need for any other SMR equipment',
        'D. Should never be used in trauma'
      ],
      ans: 1,
      exp: 'A C-collar restricts cervical motion but does not eliminate it — it is one component of SMR used with MILS and securing devices.'
    }
  ]
};
