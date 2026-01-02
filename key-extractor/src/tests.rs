use crate::{ExtractedKey, KeyExtractorVisitor};
use swc_common::{FileName, SourceMap, sync::Lrc};
use swc_core::ecma::parser::{Parser, StringInput, Syntax, TsSyntax, lexer::Lexer};
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

fn extract_keys(code: &str) -> Vec<ExtractedKey> {
    let mut module = parse_module(code);
    let mut visitor = KeyExtractorVisitor::new();
    module.visit_mut_with(&mut visitor);
    visitor.extracted_keys
}

#[test]
fn use_translations() {
    let code = r#"
        import { useTranslations } from 'next-globe-gen';
        
        function Component() {
            const t = useTranslations('common');
            return t('greeting', { _description: 'A welcome message' });
        }
    "#;
    let keys = extract_keys(code);
    assert_eq!(keys.len(), 1);
    assert_eq!(keys[0].key, "common.greeting");
    assert_eq!(keys[0].description, Some("A welcome message".to_string()));
}

#[test]
fn use_translations_without_namespace() {
    let code = r#"
        import { useTranslations } from 'next-globe-gen';

        function Component() {
            const t = useTranslations();
            return t('hello', { _description: 'Hello message' });
        }
    "#;
    let keys = extract_keys(code);
    assert_eq!(keys.len(), 1);
    assert_eq!(keys[0].key, "hello");
    assert_eq!(keys[0].description, Some("Hello message".to_string()));
}

#[test]
fn use_translations_without_description() {
    let code = r#"
        import { useTranslations } from 'next-globe-gen';

        function Component() {
            const t = useTranslations('ns');
            return t('key');
        }
    "#;
    let keys = extract_keys(code);
    assert_eq!(keys.len(), 1);
    assert_eq!(keys[0].key, "ns.key");
    assert_eq!(keys[0].description, None);
}

#[test]
fn get_translations_async() {
    let code = r#"
        import { getTranslations } from 'next-globe-gen';

        async function Page() {
            const t = await getTranslations('page');
            return t('title', { _description: 'Page title' });
        }
    "#;
    let keys = extract_keys(code);
    assert_eq!(keys.len(), 1);
    assert_eq!(keys[0].key, "page.title");
    assert_eq!(keys[0].description, Some("Page title".to_string()));
}

#[test]
fn create_translator_server_function() {
    let code = r#"
        import { createTranslator } from 'next-globe-gen';

        export async function serverFunction() {
            "use server";
            const t = createTranslator('en', 'server');
            return t('key', { _description: 'Server function key' });
        }
    "#;
    let keys = extract_keys(code);
    assert_eq!(keys.len(), 1);
    assert_eq!(keys[0].key, "server.key");
    assert_eq!(keys[0].description, Some("Server function key".to_string()));
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
                    {t('header', { _description: 'Header text'})}
                    {tPage('content', { _description: 'Page content'})}
                </>
            );
        }
    "#;
    let keys = extract_keys(code);
    assert_eq!(keys.len(), 2);
    assert_eq!(keys[0].key, "common.header");
    assert_eq!(keys[0].description, Some("Header text".to_string()));
    assert_eq!(keys[1].key, "page.content");
    assert_eq!(keys[1].description, Some("Page content".to_string()));
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
    assert_eq!(keys[0].key, "ns.staticKey");
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
    assert_eq!(keys[0].key, "ns.key");
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
    assert_eq!(keys[0].key, "section.nested.deep.key");
}

#[test]
fn template_literals_with_expressions_are_skipped() {
    let code = r#"
        import { useTranslations } from 'next-globe-gen';

        function Component({ type }) {
            const t = useTranslations('messages');
            return t(`dynamic.${type}.key`);
        }
    "#;
    let keys = extract_keys(code);
    assert_eq!(keys.len(), 0);
}

#[test]
fn dynamic_description_is_skipped() {
    let code = r#"
        import { useTranslations } from 'next-globe-gen';

        function Component({ desc }) {
            const t = useTranslations('ns');
            return t('key', { _description: desc });
        }
    "#;
    let keys = extract_keys(code);
    assert_eq!(keys.len(), 1);
    assert_eq!(keys[0].key, "ns.key");
    assert_eq!(keys[0].description, None);
}

#[test]
fn description_with_template_literal() {
    let code = r#"
        import { useTranslations } from 'next-globe-gen';

        function Component() {
            const t = useTranslations('ns');
            return t('key', { _description: `Static template description` });
        }
    "#;
    let keys = extract_keys(code);
    assert_eq!(keys.len(), 1);
    assert_eq!(keys[0].key, "ns.key");
    assert_eq!(
        keys[0].description,
        Some("Static template description".to_string())
    );
}
