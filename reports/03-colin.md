# Colin: A Multimodal Human–AI Co-Creation Storytelling System to Support Children’s Multi-Level Narrative Skills

## Report scope

This report analyzes the complete 29-page version 5 manuscript dated November 28, 2025. It covers Colin’s formative research, interaction model, prompt design, generation benchmark, parent–child study, findings, limitations, and appendices. Where the manuscript contains inconsistent counts or measures, this report distinguishes the claim from what the reported design can support.

## Bibliographic record

- **Authors:** Lyumanshan Ye, Jiandong Jiang, Yuhan Liu, Yihan Ran, Yufan Zhou, Zhao Wang, Yipeng Yu, Pengfei Liu, Danni Chang, and Yucheng Jin
- **arXiv identifier:** [2405.06495](https://arxiv.org/abs/2405.06495)
- **Version analyzed:** v5, November 28, 2025
- **Paper status in this PDF:** Manuscript submitted to ACM; the PDF still contains a placeholder DOI
- **Paper type:** Design research, implemented-system paper, formative interviews, generation comparison, and one-group pre/post user study
- **Primary domains:** Child–AI co-creation, narrative learning, interactive storytelling, multimodal interaction, parent facilitation

## Executive summary

Colin is a multimodal storytelling system designed to help children move through three levels of narrative learning: understanding story content, explaining its key idea or moral, and transferring that idea into a new story. Its central interaction loop is **question → child feedback → AI story expansion**. Children respond by voice, draw story elements, receive an AI continuation that incorporates their ideas, answer reflective questions, and finally recombine old and new visual elements to make another story expressing the same core idea.

Parents or educators remain involved through a “Customize Library.” Before a session, an adult chooses educational goals and keywords, previews and edits the AI-generated outline, and regenerates scene images. During the live child session, GPT-4 expands the story and generates questions; a sketch-completion model assists drawing; and generated content is stored for later review. The authors present this human preview as a way to align AI output with educational intentions while reducing the improvisational burden on adults.

The system is grounded in interviews with early-childhood educators and parents. Participants identified four needs: adult scaffolding, help integrating fragmented child ideas into coherent plots, multimodal support, and adaptive questioning. These became four design goals and four system features.

The paper contains two evaluations. First, three education-experienced raters compared 80 human-created and 80 GPT-4-created story responses. GPT-4 received small preference advantages across all displayed dimensions, ranging from 51% to 58%; no uncertainty estimates or significance tests are reported. Second, 20 children aged 5–13 used Colin in a single session with their parents present as recruited partners. Scores improved for key-idea understanding, generalization, and transfer; factual knowledge did not significantly change. Children generally appeared engaged and reported positive experiences.

Colin has a compelling learning sequence and several reusable interaction ideas: adult preview, child-first contribution, multimodal expression, adaptive prompts, and transfer through reconstruction. The evidence does not establish that Colin caused durable narrative-skill gains. There is no control condition, the session is brief, key statistical details are absent, the age range is wide, and the transfer comparison appears partly structurally biased because the appendix states that pre-test transfer is scored as zero while the post-test allows 0–2. Several reporting inconsistencies further limit confidence.

For CreativeOS, Colin is most valuable as a workflow reference, not as validated proof. CreativeOS can adopt the three-stage progression and contribution-preserving design while improving assent, safety, data governance, developmental adaptation, provenance, and evaluation rigor.

## Research questions and contributions

The paper asks:

1. How can LLMs be used effectively and appropriately to support adult-involved scaffolding and co-creation in narrative development?
2. How do adaptive interaction mechanisms affect learning outcomes and experience?
3. How do children and parents perceive an LLM-based storytelling system?

Its stated contributions are:

- Colin, a voice-and-drawing storytelling system with question-based scaffolding;
- an instructional prompt-engineering framework for child–AI co-creative storytelling;
- a comparative assessment of GPT-4-generated educational story content; and
- empirical observations about learning, engagement, and stakeholder perceptions.

## Learning model

The paper treats narrative skill as more than recalling events. Colin attempts to support a progression:

1. **Knowledge:** identify characters, objects, properties, and factual story information.
2. **Key idea/generalization:** explain motivations, causal relations, themes, or morals in the child’s own words.
3. **Transfer:** build a new narrative with different elements while preserving and justifying the original core idea.

This progression draws on visual narrative comprehension, story grammar, and education standards. The transfer stage is the most ambitious: it asks whether the child can abstract a principle rather than merely retell a plot.

## Formative study

### Participants and procedure

The authors conducted approximately 60-minute semi-structured interviews with education experts and parents. Five education experts participated; three had more than ten years of early-childhood education experience and two had more than three years. The manuscript is inconsistent about the parent count: the formative-study overview says three, while the method section says four parents with children aged 3–8.

Experts discussed educational objectives, classroom practices, developmental effects, implementation challenges, and AI. Parents discussed home storytelling goals, interaction practices, engagement problems, and expectations for AI assistance.

### Four formative insights

1. **Adult facilitation is important.** Children often need prompts to organize events, explain motivation, and make causal links.
2. **Children’s ideas are difficult to integrate in real time.** Imaginative responses may be fragmented or disrupt a planned story, requiring rapid adult improvisation.
3. **Multi-level narratives benefit from multimodal support.** Images, speech, gesture, and voice can clarify complex or abstract relations.
4. **Adaptive questions deepen comprehension but burden adults.** Good questions require repeated reformulation and context-sensitive follow-up.

### Resulting design goals

- adult preview and editing before child use;
- question scaffolds for live co-creation;
- combined visual and auditory narrative construction; and
- progressively deeper adaptive questioning across creation, understanding, and transfer.

The mapping from insight to goal is clear, although the small and inconsistently reported formative sample should be understood as design input rather than representative evidence.

## System design

### End-to-end workflow

```mermaid
flowchart LR
    A["Adult sets goal and keywords"] --> B["AI produces outline and four scenes"]
    B --> C["Adult previews, edits, or regenerates"]
    C --> D["Co-create: two open questions"]
    D --> E["Child speaks and draws"]
    E --> F["AI affirms, elaborates, and expands plot"]
    F --> G["Understand: recall and core-idea questions"]
    G --> H["Transfer: recombine elements into a new story"]
    H --> I["Save artifacts for adult review"]
```

### 1. Customizable story library

The adult selects an educational goal and keywords or supplies custom terms. GPT-4 creates a short outline, splits it into four parts, extracts characters and visual descriptions, and produces four scene illustrations. The adult can edit text and regenerate images before approval. The library also retains child-created elements for later stories.

This is a meaningful control point. It makes the adult responsible for the initial pedagogical premise and permits review before content becomes child-facing. It does not, however, review live continuations generated from child responses.

### 2. Conversational story expansion

GPT-4 inserts two interaction points in the story. At each point, the child answers by voice. The model acknowledges the response, adds detail, and incorporates it into the continuation while preserving the selected educational message. Two questions were chosen to limit attention demands.

The authors use a child-response taxonomy derived from a pilot with three children aged 6–8:

- **Precise response:** directly incorporate the child’s concrete idea.
- **Vague response:** affirm it and infer a more specific form.
- **Irrelevant or absent response:** restate context and guide the child back to the question.

This taxonomy is operationally useful, but “vague” answers create an authorship risk: the model may supply the decisive creative idea while presenting it as the child’s elaborated contribution.

### 3. Speak–draw–complete

Children can open a drawing board while co-creating. The system extracts or recognizes an object category and uses a sketch-completion model to assist the drawing. Drawings and AI-completed visuals become movable elements for the final construction task.

The feature connects verbal, visual, and spatial expression. It also provides a lower-barrier contribution channel for children who do not want to produce long spoken answers.

### 4. Progressive question guidance

Colin guides children through:

- plot recall and co-creation;
- interpretation of the story’s key idea; and
- transfer of that idea to a new configuration of characters and objects.

The system is instructed to correct misconceptions, re-ask questions, and provide explanations before proceeding. Random elements may be introduced during transfer to encourage generalization.

## Prompt architecture

The appendix exposes the main prompt chain:

1. simplify or generate a 3–4 sentence outline from goal, story, and keywords;
2. split the outline into beginning, two key plot points, and ending;
3. extract background and image descriptions;
4. extract character entities;
5. expand parts and generate two interaction questions;
6. process child feedback with affirmation and elaboration;
7. finish the story and generate three recall/moral questions; and
8. generate feedback and the next question in JSON.

The prompts impose an invariant: include the child’s response whenever possible while still conveying the educational message. They also request constrained JSON and word limits.

### Prompt strengths

- Decomposes one difficult generation task into inspectable stages.
- Separates adult-approved setup from child-facing live interaction.
- Preserves conversational context across story parts.
- Handles multiple response types explicitly.
- Uses structured output rather than parsing free-form prose.
- Makes the transfer objective part of the interaction design rather than an afterthought.

### Prompt risks

- The educational message is treated as fixed even when the child’s interpretation differs.
- Instructions to “patiently persuade” a child who strongly resists and repeat the question do not respect refusal as a valid outcome.
- The system is directed to praise and affirm before determining whether an idea is safe, factual, or truly attributable to the child.
- “Make sure your child understands” can encourage over-guidance and compliance rather than genuine interpretation.
- Exact word-count and single-character constraints are acknowledged as unreliable.
- JSON generation alone is not a validation or safety layer.

## Technical architecture as reported

- **Text and dialogue generation:** GPT-4 via the OpenAI API
- **Image generation:** described as ChatGLM API in the current PDF
- **Drawing assistance:** sketch-rnn
- **Modalities:** text, synthesized/narrated story audio, child speech input, generated images, freehand sketching, and movable visual elements
- **State:** conversation history and generated elements are stored to preserve continuity and support later adult review

The current manuscript does not provide a full deployment diagram, source layout, latency, cost, model-version pinning, moderation pipeline, speech-recognition details, storage schema, or privacy controls. Reproducibility is therefore mostly limited to the prompt appendix.

## Evaluation 1: GPT-4 versus human-created content

### Design

Twenty adults were recruited: 15 with early-childhood education experience and five parents of children aged 6–12. Human and GPT-4 conditions received the same outlines, goals, and child-feedback examples. The paper reports 80 stories from the 15 education-experienced participants and a matched 80 from GPT-4. Three university research assistants with more than one year of children’s education experience rated blinded pairs.

Content dimensions were preference, understandability, logical rationality, attraction, and relevance to the educational goal. Question dimensions were plot relevance, inspiration, and inclusiveness/open-endedness.

### Reported pairwise preference

| Dimension | Human | GPT-4 |
|---|---:|---:|
| Overall preference | 42% | 58% |
| Understandability | 49% | 51% |
| Logical rationality | 46% | 54% |
| Attraction | 43% | 57% |
| Story relevance | 49% | 51% |
| Question relevance | 49% | 51% |
| Inspiration | 45% | 54% |
| Inclusiveness | 48% | 52% |

The results show a consistent directional preference for GPT-4, strongest for overall preference and attraction. They do not establish statistically reliable superiority because the paper reports no confidence intervals, significance tests, unit-of-analysis explanation, tie handling, or inter-rater agreement. Most differences are near chance. The comparison may also favor the model because the prompt workflow was iteratively optimized for GPT-4 while adults completed a constrained questionnaire-like generation task rather than natural facilitation.

## Evaluation 2: parent–child user study

### Participants

The study recruited 20 parent–child pairs from training institutions and kindergartens. Child participants were 11 girls and nine boys, aged 5–13 (mean 7.97, SD 2.81). The paper reports institutional review board approval and 20 CNY compensation for a 60-minute session, although “each participant” is ambiguous given that the recruitment unit was a pair.

### Procedure

1. **Pre-test:** read a short story, answer content and key-idea questions, identify thematic words, and orally create a different story with the same theme.
2. **Colin session:** use an iPad to complete two voice and two drawing co-creation tasks, two core-value questions, and one transfer task. A research assistant offered procedural but not content help.
3. **Post-session:** complete a child-adapted five-point questionnaire and a 20-minute semi-structured interview.

The exact description of the post-test is unclear. The procedure calls the final phase a questionnaire and interview, while later analysis presents pre/post narrative scores and an appendix question list.

### Measures

- A child-adapted, pictorial “SUS” is reported with Cronbach’s alpha 0.78, though the item examples resemble satisfaction and perceived learning more than the standard System Usability Scale.
- A four-item enjoyment/engagement scale adapted from prior work has alpha 0.77.
- Behavioral indicators cover visible happiness, positive vocal tone, repeated feature use, and willingness to continue discussing Colin.
- Narrative outcomes cover knowledge, key ideas, generalization/internal response, and transfer/narrator evaluation.
- Three early-childhood-education research assistants rated child performance. The paper says disagreements were discussed but provides no reliability coefficient.

### Quantitative findings

Wilcoxon signed-rank tests were used because normality assumptions were not met.

- **Knowledge:** no significant change, p > .18.
- **Key ideas:** improvement, p < .001.
- **Generalization/internal response:** improvement, p < .001.
- **Transfer/narrator evaluation:** reported improvement, p < .001.
- **Composite score:** displayed mean rises from approximately 3.58 to 5.47 out of 8.

For transfer, eight children created a new story expressing the same core idea, nine retold the original to express the moral, and three children aged 5–6 could not construct a story.

The transfer inference is the weakest. Appendix Table 3 states that this dimension is scored zero in the pre-test and 0–2 in the post-test. If literal, the pre/post comparison is not symmetric and improvement is partly built into the scoring rule.

### Engagement and experience

- visible happiness: 16/20;
- positive tone: 16/20;
- repeated feature use: 12/20;
- continued discussion after the session: 8/20.

Response-length coding found 30.6% metacognitive comments, 29.22% substantive explanations, 9.8% irrelevant/uncertain/refused responses, and 39.2% answers under five words. These categories sum to more than 100% as printed (108.82%), suggesting overlap, denominator ambiguity, or a reporting error.

Figure 10 reports:

- happiness: 80% strongly agree, with the remainder split across other responses;
- perceived help understanding: 40% agree and 40% strongly agree;
- desire for a partner like Colin: 20% agree and 40% strongly agree;
- desire to spend more time: 55% strongly agree and smaller shares elsewhere.

The prose later says 16 of 20 children gave the highest rating on all four dimensions. That statement conflicts with the displayed distributions for questions 2–4 and should not be treated as established.

## Qualitative findings

### Perceived advantages

- Children experienced the changing story as partly “my story.”
- Drawing was repeatedly requested and gave children a concrete creative action.
- Knowing that another question would arrive appeared to increase attention.
- Parents valued the ability to set goals and inspect transfer through a child-created story.
- Children viewed AI as an inexhaustible source of repeated and novel stories when parents were busy.
- Parents and teachers believed AI could explore more branches than an adult constrained by time or habit.

### Need for personalization

Performance varied by age, personality, prior narrative skill, and home context. The authors note that two six-year-olds with professor parents outperformed many older children, then infer a possible effect of home environment and articulation skill. This is a plausible hypothesis but not a supported causal finding from two cases. The broader design implication—adapt support to the individual rather than age alone—is sound.

## Safety, ethics, and child agency

### Positive elements

- IRB approval is reported.
- An adult previews the initial story and images.
- A research assistant limits help to procedure during evaluation.
- Multiple expression modes reduce dependence on literacy.
- The paper openly acknowledges hallucinations and output unpredictability.

### Missing or problematic elements

- No input or output moderation architecture is described.
- Dynamic story continuations are not adult-previewed before reaching the child.
- Children’s voice, drawings, and conversation history are stored, but retention, deletion, training use, and guardian controls are not reported.
- The age range includes children under 13 using hosted AI APIs, yet provider-policy and data-protection implications are not discussed.
- The prompt directs the system to persuade children who resist instead of respecting disengagement.
- The system is framed around a predetermined “right” moral; disagreement may be treated as misconception rather than legitimate interpretation.
- Random transfer elements could introduce inappropriate or developmentally mismatched content unless constrained.
- Hallucinations are proposed as critical-thinking opportunities, but that requires deliberate adult-supported framing, not accidental exposure.

## Strengths

- Strong interaction concept connecting creation, comprehension, and transfer.
- Adult preview gives caregivers meaningful setup control.
- Child contributions alter both story and visual artifact.
- Multimodal design supports speech, drawing, listening, and spatial arrangement.
- Prompt appendix makes the generation workflow unusually inspectable.
- Generation quality and child experience are evaluated separately.
- The paper reports a null result for factual knowledge rather than claiming uniform improvement.
- Limitations acknowledge single-session novelty and inadequate developmental differentiation.

## Limitations and critical assessment

### No causal control

Without a control group—such as adult-led dialogic reading, non-adaptive digital storytelling, or the same content without AI—the study cannot separate Colin from repetition, researcher attention, pre/post practice, drawing, or general interactive engagement.

### Measurement asymmetry and incomplete statistics

The transfer pre-test appears fixed at zero, outcome rubrics shift names across sections, and the paper reports p-values without test statistics, effect sizes, confidence intervals, item counts, or participant-level distributions. Multiple outcomes are tested without a reported correction. Figure 8 uses means and SEM after the authors state the data are non-normal.

### Broad developmental range

Five- and thirteen-year-olds differ substantially in language, abstract reasoning, attention, motor control, and moral interpretation. A sample of 20 cannot support age-specific conclusions across this range.

### Instrument validity

Calling the adapted pictorial questionnaire “SUS” does not demonstrate equivalence to the standard instrument. Reading and explaining items aloud may also influence responses. Visible happiness and positive tone are subjective observational measures without reported blinding or reliability.

### Reporting inconsistencies

- Three versus four parents in the formative study.
- “20 participants” versus 20 parent–child pairs.
- Engagement percentages that conflict with the “16 of 20 highest on all four” claim.
- Response-type percentages totaling above 100% without stating overlap.
- “Multi-level” dimensions alternate among Key Idea, Generalization, Internal Response, Transfer Skill, and Narrator Evaluation.
- The PDF’s bibliographic block contains a placeholder DOI despite a later conference record existing externally.

### Reproducibility gaps

Prompts are visible, but code, model snapshots, sampling parameters, speech pipeline, image pipeline, moderation, latency, and complete stimuli are not. GPT-4 and hosted image services change over time, so exact behavior cannot be reconstructed from model names alone.

## Implications for CreativeOS

### Features worth adopting

- **Adult-controlled brief:** goals, themes, boundaries, and story seed are set before child interaction.
- **Previewable setup:** adults can inspect initial content without becoming mandatory co-authors during every turn.
- **Child-first turns:** the child speaks, draws, selects, or rearranges before AI elaborates.
- **Three-stage learning loop:** create → interpret → transfer.
- **Contribution library:** preserve child-originated elements and reuse them later.
- **Response-aware scaffolding:** distinguish concrete, ambiguous, off-topic, and refusal responses.
- **Multiple modalities:** voice and drawing should be equal input paths, not decorative additions.

### Necessary improvements

- Treat “I don’t know,” silence, and refusal as valid states with choices to skip, pause, switch modality, or ask an adult.
- Separate factual correction from moral interpretation; support multiple defensible readings.
- Attribute which details came from the child, AI inference, adult edit, or source story.
- Require safety validation after generation and before rendering or speech.
- Keep live content within adult-configured vocabularies, themes, and age bands.
- Make voice and drawing storage optional, time-limited, exportable, and deletable.
- Pin model versions and log prompts, parameters, moderation results, latency, and retries for research reproducibility.
- Adapt question length, abstraction, vocabulary, and drawing complexity by observed ability, not age alone.

### Better evaluation design

A stronger CreativeOS study should randomize children to at least two conditions, use parallel but equivalent stories, score the same transfer task pre and post, preregister outcomes, report effect sizes, and blind raters to condition and time point. It should compare immediate and delayed transfer, stratify or narrowly bound age, measure child versus AI contribution, and include a longitudinal home-use phase after supervised safety testing.

## Open-source repository assessment

The PDF and its prompt appendix contain no GitHub, GitLab, source-code, model-weight, or project-repository URL. The official arXiv record and exact-title searches likewise expose the paper and rendered source but no linked implementation repository. No repository was cloned for Colin. The public prompt text is useful supplementary material, but it is not a source repository.

## Bottom line

Colin offers one of the clearest workflows in this collection for turning AI storytelling into a learning sequence rather than a one-click content generator. Its adult preview, child-authored turns, multimodal construction, and transfer stage are strong product ideas. The present study provides promising usability and short-term performance signals, not reliable causal evidence of narrative-skill development. CreativeOS should borrow the workflow while strengthening child autonomy, moderation, data governance, developmental adaptation, provenance, and experimental design.

