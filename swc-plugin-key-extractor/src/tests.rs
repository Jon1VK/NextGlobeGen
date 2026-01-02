use crate::KeyExtractorVisitor;
use swc_common::{sync::Lrc, FileName, SourceMap};
use swc_core::ecma::parser::{lexer::Lexer, Parser, StringInput, Syntax, TsSyntax};
use swc_ecma_ast::Module;
use swc_ecma_visit::VisitMutWith;

fn parse_module(code: &str) -> Module {
    let source_map: Lrc<SourceMap> = Default::default();
    let source_file = source_map.new_source_file(
        Lrc::new(FileName::Custom("test.tsx".into())),
        code.to_string(),
    );
    let lexer = Lexer::new(
        Syntax::Typescript(TsSyntax {
            tsx: true,
            ..Default::default()
        }),
        Default::default(),
        StringInput::from(&*source_file),
        None,
    );
    let mut parser = Parser::new_from(lexer);
    parser.parse_module().unwrap()
}

fn extract_keys(code: &str) -> Vec<String> {
    let mut module = parse_module(code);
    let mut visitor = KeyExtractorVisitor::new();
    module.visit_mut_with(&mut visitor);
    visitor.extracted_keys
}

#[test]
fn use_translations_with_namespace() {
    let code = r#"
        import { useTranslations } from 'next-globe-gen';
        
        function Component() {
            const t = useTranslations('common');
            return t('greeting');
        }
    "#;
    let keys = extract_keys(code);
    assert_eq!(keys.len(), 1);
    assert_eq!(keys[0], "common.greeting");
}

#[test]
fn use_translations_without_namespace() {
    let code = r#"
        import { useTranslations } from 'next-globe-gen';

        function Component() {
            const t = useTranslations();
            return t('hello');
        }
    "#;
    let keys = extract_keys(code);
    assert_eq!(keys.len(), 1);
    assert_eq!(keys[0], "hello");
}

#[test]
fn get_translations_async() {
    let code = r#"
        import { getTranslations } from 'next-globe-gen';

        async function Page() {
            const t = await getTranslations('page');
            return t('title');
        }
    "#;
    let keys = extract_keys(code);
    assert_eq!(keys.len(), 1);
    assert_eq!(keys[0], "page.title");
}

#[test]
fn multiple_translators() {
    let code = r#"
        import { useTranslations } from 'next-globe-gen';

        function Component() {
            const t = useTranslations('common');
            const tPage = useTranslations('page');
            return (
                <>
                    {t('header')}
                    {tPage('content')}
                </>
            );
        }
    "#;
    let keys = extract_keys(code);
    assert_eq!(keys.len(), 2);
    assert_eq!(keys[0], "common.header");
    assert_eq!(keys[1], "page.content");
}

#[test]
fn template_literal_key() {
    let code = r#"
        import { useTranslations } from 'next-globe-gen';

        function Component() {
            const t = useTranslations('ns');
            return t(`staticKey`);
        }
    "#;
    let keys = extract_keys(code);
    assert_eq!(keys.len(), 1);
    assert_eq!(keys[0], "ns.staticKey");
}

#[test]
fn dynamic_key_skipped() {
    let code = r#"
        import { useTranslations } from 'next-globe-gen';

        function Component({ key }) {
            const t = useTranslations();
            return t(key);
        }
    "#;
    let keys = extract_keys(code);
    assert_eq!(keys.len(), 0); // Dynamic keys cannot be extracted
}

#[test]
fn renamed_import() {
    let code = r#"
        import { useTranslations as useT } from 'next-globe-gen';

        function Component() {
            const translate = useT('ns');
            return translate('key');
        }
    "#;
    let keys = extract_keys(code);
    assert_eq!(keys.len(), 1);
    assert_eq!(keys[0], "ns.key");
}

#[test]
fn nested_key() {
    let code = r#"
        import { useTranslations } from 'next-globe-gen';

        function Component() {
            const t = useTranslations('section');
            return t('nested.deep.key');
        }
    "#;
    let keys = extract_keys(code);
    assert_eq!(keys.len(), 1);
    assert_eq!(keys[0], "section.nested.deep.key");
}

#[test]
fn create_translator_with_locale_and_namespace() {
    let code = r#"
        import { createTranslator } from 'next-globe-gen';

        const t = createTranslator('en', 'common');
        const message = t('greeting');
    "#;
    let keys = extract_keys(code);
    assert_eq!(keys.len(), 1);
    assert_eq!(keys[0], "common.greeting");
}

#[test]
fn create_translator_without_namespace() {
    let code = r#"
        import { createTranslator } from 'next-globe-gen';

        const t = createTranslator('en');
        const message = t('hello');
    "#;
    let keys = extract_keys(code);
    assert_eq!(keys.len(), 1);
    assert_eq!(keys[0], "hello");
}
