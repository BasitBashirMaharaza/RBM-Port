// Editorial descriptions derived from the portfolio's existing project scope.
// No deployment claims, invented metrics, or clinical guarantees.
export const projectCaseNotes = [
  {
    purpose: 'Make a free-form symptom conversation more structured and useful.',
    output: 'Contextual triage & care discovery',
    focus: 'Conversation + healthcare workflows',
    features: [
      ['Adaptive dialogue', 'Stateful clarification gathers context across multiple turns instead of treating every symptom as an isolated query.'],
      ['Connected care signals', 'Ensemble prediction and urgency stratification support the triage workflow.'],
      ['Beyond the conversation', 'OCR-based prescription schedules and geospatial provider discovery connect information to practical next steps.'],
    ],
    consideration: 'Triage support requires careful validation; it should not be presented as a replacement for professional diagnosis.',
  },
  {
    purpose: 'Turn long documents into a source-grounded question-and-answer workflow.',
    output: 'Answers informed by retrieved context',
    focus: 'Retrieval-augmented generation',
    features: [
      ['Prepare the sources', 'LangChain partitions documents into semantic chunks that can be indexed and retrieved.'],
      ['Retrieve before generating', 'Vector representations surface relevant passages for the language model’s response context.'],
      ['An approachable interface', 'Streamlit brings document interaction and question answering into a single interface.'],
    ],
    consideration: 'Answer quality depends on the source material, chunk boundaries, and the relevance of retrieved context.',
  },
  {
    purpose: 'Create a repeatable path from untidy records to evaluated predictive models.',
    output: 'Evaluated classification & regression',
    focus: 'Data preparation + model evaluation',
    features: [
      ['Prepare reliable inputs', 'Structured cleaning and outlier handling make the starting dataset easier to inspect and use.'],
      ['Build useful features', 'Feature engineering connects the raw records to the classification or regression task.'],
      ['Inspect model behavior', 'Cross-validation and visual model analysis support a more considered evaluation.'],
    ],
    consideration: 'Cleaning, feature selection, and validation need to be designed together to avoid misleading evaluation.',
  },
  {
    purpose: 'Find relevant information even when a query uses different words from the source.',
    output: 'Semantically ranked document results',
    focus: 'Embeddings + vector retrieval',
    features: [
      ['A shared semantic space', 'Document chunks and user queries are represented as embeddings in the same space.'],
      ['Rank by meaning', 'Cosine similarity compares those representations to identify relevant chunks.'],
      ['Search beyond keywords', 'Vector indexing supports retrieval across synonyms and alternate phrasing in unstructured material.'],
    ],
    consideration: 'Embedding selection, chunking, and similarity thresholds shape which results are useful for a particular collection.',
  },
  {
    purpose: 'Connect search discoverability with the way people actually engage with content.',
    output: 'Practical visibility insights',
    focus: 'Search intent + behavior analysis',
    features: [
      ['Understand the intent', 'Intent mapping connects content decisions to the information people are trying to find.'],
      ['Inspect discoverability', 'Crawl optimization provides a structured way to identify search visibility improvements.'],
      ['Read engagement signals', 'Web analytics and behavior analysis add context to content performance and growth decisions.'],
    ],
    consideration: 'An audit identifies opportunities; improvements should be assessed against observed behavior rather than assumed traffic gains.',
  },
];
