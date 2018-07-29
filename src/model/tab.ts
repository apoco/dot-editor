type Tab = {
  tabId: string,
  filename: string,
  code: string,
  errors: string | null,
  svg: string,
  isDirty: boolean
};

export default Tab;
