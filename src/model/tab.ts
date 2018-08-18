type Tab = {
  tabId: string,
  filename: string | null,
  code: string | null,
  errors: string | null,
  svg: string | null,
  isDirty: boolean
};

export default Tab;
