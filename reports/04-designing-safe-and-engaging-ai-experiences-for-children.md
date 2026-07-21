# Designing Safe and Engaging AI Experiences for Children: Towards the Definition of Best Practices in UI/UX Design

## Report scope

This report covers the complete four-page workshop proposal contained in the six-page PDF; the final two PDF pages are arXiv figure-asset notices rather than paper content. The paper proposes a community process and high-level design principles. It does not report an implemented system, empirical study, validated metric set, or completed framework.

## Bibliographic record

- **Authors:** Grazia Ragone, Paolo Buono, and Rosa Lanzilotti
- **Event:** CHI 2024 Workshop on Child-Centred AI Design, Honolulu, May 11, 2024
- **arXiv:** [2404.14218](https://arxiv.org/abs/2404.14218), version 1, April 22, 2024
- **Paper type:** Workshop/position proposal
- **Primary topics:** Child-centered AI, UI/UX, safety, trustworthiness, engagement, evaluation, participatory design
- **DOI status:** The PDF contains a placeholder rather than a resolved DOI

## Executive summary

The paper argues that child-facing AI cannot be designed by interface specialists alone. It proposes a multidisciplinary, iterative process involving children, psychologists, educators, assessment specialists, researchers, and designers. The goal is to develop UI/UX guidance and evaluation methods that balance learning, engagement, safety, reliability, fairness, transparency, accessibility, and child autonomy.

Its design process combines collaborative workshops, child-centered design sessions, rapid prototyping, user testing, observation, ethnography, and mixed-method evaluation. Its product guidance favors simple navigation, age-appropriate language and content, interactive feedback, personalization, caregiver involvement where necessary, transparent explanations of AI and data use, content filtering, privacy policies, accessibility, representative content, and user control.

The paper adopts seven broad Human-Centered AI qualities as evaluation targets: transparency, explainability, accuracy, consistency, robustness, fairness, and user control/autonomy. It illustrates why each matters for children—for example, accuracy in language learning, consistency in storytelling, and fairness in personalized recommendations.

This is a useful orientation document, but it stops before operationalization. It does not define thresholds, test procedures, failure taxonomies, age bands, risk levels, child-readable explanation criteria, measurement instruments, or governance responsibilities. It repeatedly calls its proposal a “framework,” yet the paper provides a set of principles and activities rather than a formal framework that another team can implement or validate.

For CreativeOS, the paper is best treated as a coverage checklist. Its major value is ensuring that design work includes developmental, educational, ethical, and assessment expertise. CreativeOS still needs to translate every principle into a specific requirement, measurable indicator, test case, owner, and release gate.

## Problem framing

The authors identify a gap between general Human-Centered AI ideas and the realities of designing for children. Child-facing AI must:

- match changing cognitive and developmental capacities;
- maintain engagement without exploiting attention;
- produce reliable and age-appropriate content;
- communicate limitations and data use in understandable ways;
- support learning goals;
- protect privacy and well-being;
- avoid representational and decision bias; and
- negotiate the tension between child autonomy and adult responsibility.

They argue that safety, trustworthiness, and reliability must be evaluated alongside learning and engagement rather than treated as separate compliance concerns.

## Proposed design and research process

```mermaid
flowchart LR
    A["Multistakeholder workshop"] --> B["Requirements and risks"]
    B --> C["Child-centered design sessions"]
    C --> D["Rapid prototypes"]
    D --> E["Child user testing"]
    E --> F["Observation, ethnography, and measures"]
    F --> G["Guideline refinement"]
    G --> C
```

### Collaborative workshops

Children, educators, psychologists, assessment specialists, researchers, and designers jointly identify requirements and generate ideas. The workshop is intended to prevent one professional perspective from defining children’s needs for everyone else.

### Child-centered design sessions

Children actively contribute to interface design. The paper draws on participatory-design traditions in which children are more than end-stage testers.

### Rapid prototyping and iteration

Teams create successive interface versions and test them with children. Feedback informs refinement before large implementation commitments.

### Mixed methods and contextual research

Observation and ethnography are proposed alongside quantitative data. The rationale is that children’s interaction depends on social and cultural context, and self-report alone may miss important behavior or misunderstanding.

### Specialist evaluation

Assessment expertise is included to align interactions with educational objectives and measure learning outcomes accurately. Psychologists and educators are expected to assess developmental fit and well-being.

## UI/UX best practices proposed

### Simplicity and comprehension

- clear navigation;
- intuitive controls;
- language matched to age and literacy;
- content matched to developmental stage; and
- direct, understandable feedback.

The paper correctly links simplicity to comprehension, not visual minimalism alone. A visually sparse interface can still be conceptually opaque if AI actions, permissions, or consequences are unclear.

### Engagement

Interactive features, animation, and gamification are proposed as means to sustain motivation. This recommendation needs safeguards: engagement should support a meaningful task rather than maximize session length, return frequency, or emotional dependence.

### Personalization, autonomy, and caregiver involvement

Customization can increase ownership and let children shape learning. The paper also notes that unrestricted autonomy may conflict with safety and therefore sometimes requires caregiver intervention.

This is a central but unresolved design tension. Appropriate adult involvement depends on age, risk, context, and the child’s rights. A caregiver dashboard can protect a young child but can also become surveillance or suppress private exploration. The paper identifies the tension but does not propose a decision model.

### Transparency and trust

Children should understand what the AI does, its limitations, and how data are used. The goal is described as “building trust,” but the better product objective is **calibrated trust**: children should rely on the system when it is competent and question or disengage when it is not.

### Safety and privacy

The paper calls for content filtering and privacy policies. These are necessary but underspecified. A policy does not protect a child unless it is implemented through data minimization, consent/assent, retention controls, access restrictions, model-provider constraints, abuse response, and deletion.

### Inclusion, fairness, and diversity

The interface should support diverse abilities and avoid biased content or representation. Accessibility is treated as an overarching concern rather than an optional mode.

## Proposed evaluation dimensions

| Dimension | Paper’s intended meaning | Child-facing example | What remains unspecified |
|---|---|---|---|
| Transparency | AI operation is visible | Child knows content came from AI | Required disclosure detail and comprehension test |
| Explainability | AI behavior can be understood | Age-appropriate reason for a recommendation | Age bands, explanation formats, accuracy criteria |
| Accuracy | Output avoids misinformation | Correct language-learning translation | Error tolerance and factual validation source |
| Consistency | Similar use produces reliable behavior | Storytelling app behaves predictably over time | Expected invariants versus healthy creative variety |
| Robustness | System handles varied input and context | Educational game adapts without failing | Adversarial, noisy, dialect, accessibility, and edge-case tests |
| Fairness | Children receive equitable treatment | Recommendations are not biased by identity | Protected groups, audit method, outcome parity definition |
| User control | Child can shape or stop interaction | Personalization and meaningful choices | Adult override, refusal, deletion, and appeal behavior |

The seven dimensions are relevant, but they mix technical properties, interface properties, social outcomes, and governance. A single score called “trustworthiness” would hide important tradeoffs.

## Contributions

1. Frames child AI UI/UX as multidisciplinary and participatory.
2. Brings safety, trustworthiness, reliability, learning, and engagement into one design conversation.
3. Proposes an iterative workshop-to-testing process.
4. Summarizes child-facing UI/UX principles.
5. Adapts general Human-Centered AI qualities to examples involving children.

## Strengths

- Correctly treats children as participants in design rather than only protected users.
- Includes assessment and educational expertise, not just design and engineering.
- Recognizes that child needs change with development.
- Connects interface choices to privacy, fairness, and reliability.
- Recommends mixed methods and contextual observation.
- Acknowledges the real tension between autonomy and caregiver intervention.
- Positions accessibility and inclusion as core design concerns.

## Limitations and critical assessment

### Proposal, not evidence

No children, caregivers, experts, or systems were studied. There are no results to evaluate, despite language suggesting that “following” the framework will create safe and ethically sound systems. The paper establishes plausibility, not effectiveness.

### Framework is not operational

The paper does not specify stages with entry/exit criteria, artifacts, accountable roles, decision rules, or acceptance thresholds. Different teams could claim compliance while building materially different experiences.

### Safety lacks a threat model

Relevant risks include harmful output, grooming-like interaction, emotional dependency, manipulative engagement, disclosure of personal information, biased representation, factual hallucination, self-harm content, abuse disclosure, model memorization, unauthorized purchases, and adult misuse. The paper names broad safety qualities but does not map hazards to controls.

### No age or context segmentation

“Children” covers radically different developmental stages. A voice assistant for a preschooler, a creative tool for a nine-year-old, and a social chatbot for a teenager require different language, autonomy, consent, and escalation models.

### Engagement is insufficiently qualified

Animation and gamification can support learning, but they can also produce distraction, compulsion, or reward-seeking. The paper does not distinguish task engagement, cognitive engagement, social engagement, enjoyment, retention, and addictive use.

### Transparency is treated too simply

Knowing that AI exists is different from understanding uncertainty, provenance, inference, and data flow. Explainability can also create misplaced trust if an explanation sounds plausible but does not faithfully represent system behavior.

### Caregiver control remains unresolved

The paper provides no principles for proportionality, child privacy, contested family settings, or when adult visibility should be limited. “Caregiver intervention” is not universally protective.

### Narrow evidence base

The paper cites eight sources, primarily broad books, methods references, one Human-Centered AI article, and a frameworks report. It is not a systematic synthesis of child-AI safety research or regulation.

## Implications for CreativeOS

### Turn principles into controls

CreativeOS should maintain a traceability table with:

- risk or child need;
- product requirement;
- implementation control;
- child-facing UI behavior;
- evaluation method;
- acceptance threshold;
- responsible owner; and
- evidence collected before release.

Examples:

| Principle | Concrete CreativeOS requirement | Verification |
|---|---|---|
| Transparency | Label AI-generated story elements and show a child-readable contribution history | Comprehension test by age band |
| Accuracy | Ground factual educational claims and block unsupported generation in high-risk topics | Curated challenge set and expert review |
| Consistency | Preserve character facts and safety rules across turns | Automated multi-turn regression suite |
| Robustness | Handle noise, accents, short answers, refusal, and adversarial input safely | Red-team scenarios with child-safety review |
| Fairness | Audit characters, roles, dialect handling, and moderation errors across groups | Stratified output and failure analysis |
| User control | Pause, skip, undo, delete, switch modality, and request adult help | Usability and autonomy testing |
| Privacy | Minimize, separate, expire, export, and delete child data | Architecture review and deletion audit |

### Stakeholder program

Use children as design partners where appropriate, but do not make them responsible for discovering safety failures. Pair participatory work with expert hazard analysis, caregiver input, accessibility review, and adversarial testing. Report whose recommendations were adopted or rejected and why.

### Measure the right engagement

Prefer task persistence, voluntary creative contribution, reflection, collaboration, and learning transfer over total time, streaks, or return rate. Include stopping comfortably as a successful outcome.

### Separate trust from trustworthiness

Measure both:

- whether the system behaves reliably and safely; and
- whether children can accurately judge when to trust, question, correct, or stop it.

## Open-source repository assessment

The workshop proposal does not describe an implemented artifact and contains no repository URL. The official arXiv record and exact-title searches did not identify an author-linked source repository. No repository was cloned for this paper.

## Bottom line

The paper supplies the right high-level categories and insists on multidisciplinary, participatory design. It does not yet provide best practices in the strong sense of tested, operational guidance. CreativeOS can use it to prevent category omissions, but must create its own child-specific threat model, age segmentation, measurable requirements, safety cases, and release gates.

